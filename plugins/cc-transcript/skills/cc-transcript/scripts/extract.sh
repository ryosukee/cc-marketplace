#!/usr/bin/env bash
set -euo pipefail

SESSION_ID="${1:?session_id required}"
N="${2:-20}"
SCOPE="${3:-dialogue}"

case "$SCOPE" in
  dialogue|full) ;;
  *)
    echo "cc-transcript: unknown scope '$SCOPE' (use dialogue|full)" >&2
    exit 2
    ;;
esac

JSONL=$(find "$HOME/.claude/projects" -maxdepth 2 -type f -name "${SESSION_ID}.jsonl" 2>/dev/null | head -n1)
if [ -z "$JSONL" ]; then
  echo "cc-transcript: session JSONL not found for ${SESSION_ID}" >&2
  exit 1
fi

OUTPUT="/tmp/cc-transcript-${SESSION_ID}.md"

jq -sr --argjson n "$N" --arg scope "$SCOPE" '
  # Neutralize vim fold markers inside content so they do not collide with structural folds
  def sanitize:
    if type == "string" then gsub("\\{\\{\\{"; "{{ {") | gsub("\\}\\}\\}"; "} }}")
    else . end;

  def blocks_of_record:
    . as $rec
    | $rec.message.content as $c
    | if ($c | type) == "string" then
        (if $rec.type == "user" then [{kind: "user_text", text: ($c | sanitize)}] else [] end)
      elif ($c | type) == "array" then
        [ $c[] |
          if .type == "text" and $rec.type == "user" then {kind: "user_text", text: ((.text // "") | sanitize)}
          elif .type == "text" and $rec.type == "assistant" then {kind: "assistant_text", text: ((.text // "") | sanitize)}
          elif .type == "thinking" and ((.thinking // "") | length) > 0 then {kind: "thinking", text: (.thinking | sanitize)}
          elif .type == "tool_use" then {kind: "tool_use", name: (.name // "?"), id: (.id // ""), input: (.input // {})}
          elif .type == "tool_result" then {kind: "tool_result", tool_use_id: (.tool_use_id // ""), content: (.content // "")}
          else empty
          end
        ]
      else []
      end;

  def category:
    if .kind == "user_text" then "user"
    elif .kind == "assistant_text" then "assistant"
    elif .kind == "thinking" or .kind == "tool_use" or .kind == "tool_result" then "internal"
    else "other"
    end;

  def tool_summary:
    if .name == "Read" or .name == "Write" or .name == "Edit" then (.input.file_path // "?")
    elif .name == "NotebookEdit" then (.input.notebook_path // "?")
    elif .name == "Bash" then (.input.description // ((.input.command // "") | .[0:80]))
    elif .name == "Grep" or .name == "Glob" then (.input.pattern // "?")
    elif .name == "WebFetch" then (.input.url // "?")
    elif .name == "WebSearch" then (.input.query // "?")
    elif .name == "Task" or .name == "Agent" then (.input.description // ((.input.prompt // "") | .[0:80]))
    elif .name == "Skill" then (.input.skill // .input.command // "?")
    elif .name == "TodoWrite" then "\(.input.todos | length) items"
    elif .name == "AskUserQuestion" then "\((.input.questions // []) | length) question(s)"
    else (.input | tojson | .[0:80])
    end;

  def result_text($r):
    if $r == null then "_(no result)_"
    else
      (if ($r.content | type) == "string" then ($r.content | sanitize)
       elif ($r.content | type) == "array" then
         ($r.content | map(if .type == "text" then ((.text // "") | sanitize) else (. | tojson | sanitize) end) | join("\n"))
       else "" end) as $body
      | "→\n\n```\n" + $body + "\n```"
    end;

  def render_pair($by_id):
    ($by_id[.id // ""] // null) as $r
    | "#### " + .name + ": " + (tool_summary | sanitize) + "\n\n"
      + "```json\n" + (.input | tojson | sanitize) + "\n```\n\n"
      + result_text($r);

  def render_internal:
    (.blocks | map(select(.kind == "tool_use"))) as $uses
    | (reduce (.blocks | map(select(.kind == "tool_result"))[]) as $r ({}; . + {($r.tool_use_id // ""): $r})) as $by_id
    | (if ($uses | length) == 0 then "thinking"
       else
         ($uses | group_by(.name) | map({name: .[0].name, count: length}) | sort_by(.count) | reverse
          | map("\(.name) x\(.count)") | join(", "))
       end) as $summary
    | "<!-- " + $summary + " {{{ -->\n\n"
      + (.blocks | map(
          if .kind == "tool_use" then render_pair($by_id)
          elif .kind == "thinking" then
            (if ($uses | length) == 0 then .text
             else "_(thinking)_\n\n" + .text
             end)
          else empty
          end
        ) | join("\n\n"))
      + "\n\n<!-- }}} -->";

  def group_segments:
    reduce .[] as $b ([];
      (if length == 0 then null else .[-1] end) as $last
      | ($b | category) as $cat
      | if ($last == null) or ($last.cat != $cat) then
          . + [{cat: $cat, blocks: [$b]}]
        else
          .[0:-1] + [{cat: $cat, blocks: ($last.blocks + [$b])}]
        end
    );

  def render_segment:
    if .cat == "user" then "## user\n\n" + (.blocks | map(.text) | join("\n\n"))
    elif .cat == "assistant" then "## assistant\n\n" + (.blocks | map(.text) | join("\n\n"))
    elif .cat == "internal" then render_internal
    else ""
    end;

  map(select(.type == "user" or .type == "assistant"))
  | (if $scope == "full" then
       .[(-$n):]
       | [.[] | blocks_of_record[]]
     else
       [.[] | blocks_of_record[]]
       | map(select(.kind == "user_text" or .kind == "assistant_text"))
       | .[(-$n):]
     end)
  | group_segments
  | map(render_segment)
  | join("\n\n")
' "$JSONL" > "$OUTPUT"

printf '\n<!-- vim: set foldmethod=marker foldlevel=0 filetype=markdown : -->\n' >> "$OUTPUT"

printf '%s\n' "$OUTPUT"
