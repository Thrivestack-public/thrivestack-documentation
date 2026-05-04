#!/usr/bin/env python3
"""
Regenerate public/api/get-accounts.html article body from GetAccountDataDocumentation.tsx
(filter/sort catalog, examples, tips). Run from repo root after updating the TSX in plg-crm-ui.
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

TSX_DEFAULT = Path(
    "/Users/ajinkyakale/customer-analytics/plg-crm-ui/src/components/Onboarding/"
    "PersonalizedCustomerExperiences/APITests/account/GetAccountDataDocumentation.tsx"
)
REPO = Path(__file__).resolve().parents[1]
HTML_PATH = REPO / "public" / "api" / "get-accounts.html"

CATEGORY_ORDER_ACCOUNT = [
    "Basic",
    "Acquisition",
    "Activation",
    "Monetization",
    "Engagement",
    "Expansion",
    "Firmographics",
]

OPTIONAL_ACTIVATION_GRAPHQL_PATHS = frozenset(
    {
        "activation.activatedOn",
        "activation.ttv",
        "activation.timeSpent",
        "activation.championUser",
    }
)


def extract_const_array_block(text: str, const_name: str) -> str:
    m = re.search(rf"const {const_name}:\s*[^=]+=\s*\[", text)
    if not m:
        raise SystemExit(f"Could not find const {const_name} in TSX")
    i = m.end() - 1
    depth = 0
    j = i
    while j < len(text):
        if text[j] == "[":
            depth += 1
        elif text[j] == "]":
            depth -= 1
            if depth == 0:
                return text[i + 1 : j]
        j += 1
    raise SystemExit(f"Unclosed array for {const_name}")


def split_top_level_objects(array_body: str) -> list[str]:
    objs: list[str] = []
    depth = 0
    start: int | None = None
    i = 0
    while i < len(array_body):
        c = array_body[i]
        if c == "{":
            if depth == 0:
                start = i
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0 and start is not None:
                objs.append(array_body[start : i + 1])
                start = None
        i += 1
    return objs


def parse_ts_string(s: str, i: int) -> tuple[str, int]:
    q = s[i]
    if q not in "\"'":
        raise ValueError(f"expected string at {i}, got {q!r}")
    i += 1
    out: list[str] = []
    while i < len(s):
        if s[i] == "\\":
            i += 1
            if i < len(s):
                out.append(s[i])
                i += 1
        elif s[i] == q:
            return "".join(out), i + 1
        else:
            out.append(s[i])
            i += 1
    raise ValueError("unterminated string")


def parse_ts_object(obj: str) -> dict[str, str | bool]:
    inner = obj.strip()
    if not (inner.startswith("{") and inner.endswith("}")):
        raise ValueError("not an object")
    inner = inner[1:-1]
    i = 0
    fields: dict[str, str | bool] = {}

    def skip_ws():
        nonlocal i
        while i < len(inner) and inner[i] in " \t\n,":
            i += 1

    while True:
        skip_ws()
        if i >= len(inner):
            break
        m = re.match(r"(\w+)\s*:", inner[i:])
        if not m:
            raise ValueError(f"expected field at {i}: {inner[i : i + 40]!r}")
        key = m.group(1)
        i += m.end()
        skip_ws()
        if i >= len(inner):
            raise ValueError("truncated after key")
        if inner[i : i + 4] == "true":
            fields[key] = True
            i += 4
        elif inner[i : i + 5] == "false":
            fields[key] = False
            i += 5
        elif inner[i] in "\"'":
            val, i = parse_ts_string(inner, i)
            fields[key] = val
        else:
            raise ValueError(f"unsupported value for {key} at {i}: {inner[i : i + 20]!r}")
    return fields


def field_display_type_to_graphql(path: str, display_type: str) -> str:
    t = display_type.strip()
    if t == "Array":
        return "[AbuseRuleResult!]!"
    if t == "[String]":
        return "[String!]!"
    if t == "Int":
        return "Int!"
    if t == "Float":
        return "Float" if path in OPTIONAL_ACTIVATION_GRAPHQL_PATHS else "Float!"
    if t == "Boolean":
        return "Boolean!"
    if t == "String":
        return "String" if path in OPTIONAL_ACTIVATION_GRAPHQL_PATHS else "String!"
    if "Number (ratio)" in t or "Number (0" in t:
        return "Float!"
    if t == "Number" or t.startswith("Number"):
        return "Float!"
    if "ISO" in t or "ISO date" in t:
        return "String!"
    return "String!"


def build_account_field_catalog(filter_keys: list[dict], field_reference: list[dict]) -> list[dict]:
    filter_by_path = {fk["key"]: fk for fk in filter_keys}
    ref_by_path = {fr["key"]: fr for fr in field_reference}
    paths = sorted(set(filter_by_path) | set(ref_by_path))
    rows = []
    for path in paths:
        fk = filter_by_path.get(path)
        fr = ref_by_path.get(path)
        category = fr["category"] if fr else fk["category"]  # type: ignore
        label = fr["name"] if fr else path
        filterable = fk is not None
        sortable = bool(fk["sortable"]) if fk else False
        description = fr["description"] if fr else fk["description"]  # type: ignore
        example = fr.get("example", "") if fr else ""
        display_type = fr["type"] if fr else fk["type"]  # type: ignore
        rows.append(
            {
                "category": category,
                "path": path,
                "label": label,
                "graphqlType": field_display_type_to_graphql(path, str(display_type)),
                "filterable": filterable,
                "sortable": sortable,
                "description": description,
                "example": example,
            }
        )
    return rows


def extract_template_literal(text: str, const_name: str) -> str:
    m = re.search(rf"const {const_name}\s*=\s*`", text)
    if not m:
        raise SystemExit(f"Could not find const {const_name} = ` in TSX")
    i = m.end()
    out: list[str] = []
    while i < len(text):
        if text[i] == "`" and text[i - 1] != "\\":
            return "".join(out)
        out.append(text[i])
        i += 1
    raise SystemExit(f"unterminated template for {const_name}")


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def render_account_fields_table(rows: list[dict]) -> str:
    def cat_order(c: str) -> int:
        try:
            return CATEGORY_ORDER_ACCOUNT.index(c)
        except ValueError:
            return 999

    sorted_rows = sorted(rows, key=lambda r: (cat_order(str(r["category"])), str(r["path"])))
    lines = [
        '                        <section id="account-fields" class="content-section">',
        '                            <h2>Account fields</h2>',
        '                            <p class="doc-muted-label">Filter &amp; sort reference</p>',
        '                            <p>Use this table when choosing <code>filters[].key</code> and <code>sort.key</code>. '
        "It lists every path on <code>Account</code> (and nested objects) and whether the growth-intelligence "
        "account list allows it for filtering or sorting (see <code>accountFieldByGraphQLKey</code> in "
        "<code>public-api-events</code>). Paths with <strong>Filter</strong> or <strong>Sort</strong> set to "
        "<strong>No</strong> are still valid in GraphQL selections (for example "
        "<code>acquisition.abuseRuleResult</code>, <code>activation.*</code>) but cannot be used as "
        "<code>filters[].key</code> or <code>sort.key</code> until the registry exposes them. Invalid keys "
        "produce a GraphQL error.</p>",
        '                            <div class="doc-table-xscroll">',
        '                            <table class="params-table">',
        "                                <thead>",
        "                                    <tr>",
        '                                        <th>Category</th>',
        '                                        <th>Path</th>',
        '                                        <th>Filter</th>',
        '                                        <th>Sort</th>',
        '                                        <th>Type</th>',
        '                                        <th>Description</th>',
        '                                        <th>Example</th>',
        "                                    </tr>",
        "                                </thead>",
        "                                <tbody>",
    ]
    for r in sorted_rows:
        yn_f = "Yes" if r["filterable"] else "No"
        yn_s = "Yes" if r["sortable"] else "No"
        ex = r["example"]
        ex_cell = f"<code>{esc(ex)}</code>" if ex else "—"
        lines.append(
            "                                    <tr>"
            f'<td>{esc(str(r["category"]))}</td>'
            f'<td><code>{esc(str(r["path"]))}</code><br><span class="doc-subtle">{esc(str(r["label"]))}</span></td>'
            f"<td>{yn_f}</td>"
            f"<td>{yn_s}</td>"
            f'<td><code>{esc(str(r["graphqlType"]))}</code></td>'
            f'<td>{esc(str(r["description"]))}</td>'
            f"<td>{ex_cell}</td>"
            "</tr>"
        )
    lines += [
        "                                </tbody>",
        "                            </table>",
        "                            </div>",
        "                        </section>",
    ]
    return "\n".join(lines)


def render_input_section() -> str:
    return r"""                        <section id="input" class="content-section">
                            <h2>Input: <code>GetAccountsRequest</code></h2>
                            <p>All three input fields are optional — omit them to retrieve the first page of all
                                accounts. Combine <code>filters</code>, <code>sort</code>, and <code>pagination</code>
                                to build segmentation queries.</p>

                            <h3 id="filters"><code>filters</code> · optional · array</h3>
                            <p>An array of filter objects. All filters are <strong>ANDed</strong> together: an account
                                must satisfy every filter to appear in results. Each filter has three fields:</p>
                            <pre><code>{
  "key": "&lt;dot-notation field path&gt;",
  "operator": "equals | not_equals | greater_than | less_than | greater_than_or_equal | less_than_or_equal",
  "value": "&lt;string value&gt;"
}</code></pre>
                            <p>The <code>value</code> is always a string; it is coerced server-side. Use keys from the
                                <a href="#account-fields">Account fields</a> table where <strong>Filter</strong> is
                                Yes. Paths with Filter No are still queryable in GraphQL but cannot be used as
                                <code>filters[].key</code>.</p>

                            <h4 id="filter-operators">Operators</h4>
                            <table class="params-table">
                                <thead>
                                    <tr>
                                        <th>Operator</th>
                                        <th>Symbol</th>
                                        <th>Description</th>
                                        <th>Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>equals</code></td>
                                        <td>=</td>
                                        <td>Exact match</td>
                                        <td><code>key: "monetization.plan"</code>, <code>value: "pro"</code></td>
                                    </tr>
                                    <tr>
                                        <td><code>not_equals</code></td>
                                        <td>≠</td>
                                        <td>Excludes the given value</td>
                                        <td><code>key: "engagement.status"</code>, <code>value: "Churned"</code></td>
                                    </tr>
                                    <tr>
                                        <td><code>greater_than</code></td>
                                        <td>&gt;</td>
                                        <td>Numeric or date comparison (exclusive)</td>
                                        <td><code>key: "monetization.mrr"</code>, <code>value: "500"</code></td>
                                    </tr>
                                    <tr>
                                        <td><code>less_than</code></td>
                                        <td>&lt;</td>
                                        <td>Numeric or date comparison (exclusive)</td>
                                        <td><code>key: "monetization.mrr"</code>, <code>value: "100"</code></td>
                                    </tr>
                                    <tr>
                                        <td><code>greater_than_or_equal</code></td>
                                        <td>≥</td>
                                        <td>Numeric or date comparison (inclusive)</td>
                                        <td><code>key: "monetization.arr"</code>, <code>value: "1200"</code></td>
                                    </tr>
                                    <tr>
                                        <td><code>less_than_or_equal</code></td>
                                        <td>≤</td>
                                        <td>Numeric or date comparison (inclusive)</td>
                                        <td><code>key: "engagement.monthlyActiveUsers"</code>, <code>value: "50"</code></td>
                                    </tr>
                                </tbody>
                            </table>

                            <h3 id="sort"><code>sort</code> · optional · object</h3>
                            <p>Sort by exactly one field per request. <code>sort.key</code> must be a path whose
                                <strong>Sort</strong> column is <strong>Yes</strong> in the <a href="#account-fields">Account fields</a>
                                table (same rules as <code>accountFieldByGraphQLKey</code>).</p>
                            <pre><code>{
  "key": "&lt;dot-notation path — Sort = Yes in Account fields table&gt;",
  "direction": "asc" | "desc"
}</code></pre>
                            <p><strong>Tip:</strong> Sort by <code>monetization.mrr</code> <code>desc</code> to see
                                highest-revenue accounts first, or <code>engagement.activityTrend</code>
                                <code>asc</code> to surface accounts with declining activity. Only paths with
                                <strong>Sort = Yes</strong> in the Account fields table are valid sort keys.</p>

                            <h3 id="pagination"><code>pagination</code> · optional · object</h3>
                            <p>Cursor-free page-based pagination. Defaults to page <code>1</code>, size <code>10</code>
                                if omitted.</p>
                            <pre><code>{
  "number": 1,
  "size": 10
}</code></pre>
                            <ul>
                                <li><code>number</code> — page number, starts at 1</li>
                                <li><code>size</code> — records per page, max 100</li>
                            </ul>
                            <p>To iterate all results, increment <code>number</code> until the returned
                                <code>account</code> array is empty.</p>
                        </section>"""


def render_example_request(example_query: str, example_variables: str) -> str:
    q = html.escape(example_query.rstrip(), quote=False)
    v = html.escape(example_variables.rstrip(), quote=False)
    return f"""                        <section id="example-request" class="content-section">
                            <h2>Example request</h2>
                            <p>This example fetches Pro accounts with MRR above $200, ordered by highest MRR first,
                                excluding accounts with a Churned engagement status.</p>

                            <h3>GraphQL query</h3>
                            <pre><code>{q}</code></pre>

                            <h3>Variables (JSON)</h3>
                            <pre><code>{v}</code></pre>
                        </section>"""


def render_curl(example_query: str, example_variables: str) -> str:
    q_one_line = " ".join(line.strip() for line in example_query.strip().splitlines() if line.strip())
    variables = json.loads(example_variables.strip())
    payload = {"query": q_one_line, "variables": variables}
    body = json.dumps(payload, indent=2)
    curl_block = (
        "curl --location 'https://api.app.thrivestack.ai/growth-intelligence' \\\n"
        "--header 'content-type: application/json' \\\n"
        "--header 'x-api-key: YOUR_API_KEY' \\\n"
        "--data '\n"
        + body
        + "\n'"
    )
    curl_esc = html.escape(curl_block, quote=False)
    return f"""                        <section id="curl-example" class="content-section">
                            <h2>cURL</h2>
                            <p>Run this from your terminal to test the API (replace <code>YOUR_API_KEY</code> as needed).</p>
                            <pre><code>{curl_esc}</code></pre>
                        </section>"""


def render_example_response(example_response: str) -> str:
    j = html.escape(example_response.rstrip(), quote=False)
    return f"""                        <section id="example-response" class="content-section">
                            <h2>Example response</h2>
                            <p>The response wraps matching accounts in <code>data.getAccounts.account[]</code>.
                                The <code>message</code> field is optional in the schema and may be <code>"success"</code>
                                or omitted depending on the server response.</p>
                            <pre><code>{j}</code></pre>
                        </section>"""


def render_tips() -> str:
    return r"""                        <section id="tips" class="content-section">
                            <h2>Tips &amp; best practices</h2>
                            <blockquote class="note-callout">
                            <ul>
                                <li><strong>Filter values are always strings</strong> — the server coerces them to the
                                    correct type. Pass <code>"true"</code> for booleans, <code>"299.0"</code> for
                                    numbers.</li>
                                <li><strong>All filters are ANDed.</strong> To segment Pro accounts that are also
                                    healthy, add two separate filter objects rather than combining values.</li>
                                <li><strong>Registry vs GraphQL.</strong> The Account fields table mirrors
                                    <code>accountFieldByGraphQLKey</code> for list filters/sort. You can still query
                                    response-only paths (for example <code>activation</code>,
                                    <code>acquisition.abuseRuleResult</code>) in GraphQL when you need them on the wire.</li>
                                <li><strong>Request only the fields you need.</strong> Omitting heavy objects like
                                    <code>firmographics</code> or <code>acquisition.abuseRuleResult</code> meaningfully
                                    reduces response size.</li>
                                <li><strong>Use <code>engagement.status</code> for at-risk detection.</strong> Values are
                                    Healthy, At Risk, Critical, New, and Inactive.</li>
                                <li><strong>Expansion signals are additive.</strong> Filter on
                                    <code>expansion.expansionSignalCount</code> <code>greater_than</code>
                                    <code>"0"</code> for upsell candidates, and
                                    <code>expansion.contractionSignalCount</code> <code>greater_than</code>
                                    <code>"0"</code> for churn risk.</li>
                            </ul>
                            </blockquote>
                        </section>"""


def render_api_details() -> str:
    return r"""                        <section id="api-details" class="content-section">
                            <h2>API details</h2>
                            <table class="params-table">
                                <thead>
                                    <tr>
                                        <th>Property</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Endpoint</td>
                                        <td><code>POST /growth-intelligence</code></td>
                                    </tr>
                                    <tr>
                                        <td>Protocol</td>
                                        <td>GraphQL over HTTP</td>
                                    </tr>
                                    <tr>
                                        <td>Authentication</td>
                                        <td><code>x-api-key</code> header</td>
                                    </tr>
                                    <tr>
                                        <td>Content-Type</td>
                                        <td><code>application/json</code></td>
                                    </tr>
                                    <tr>
                                        <td>Operation</td>
                                        <td><code>query GetAccounts</code></td>
                                    </tr>
                                    <tr>
                                        <td>Response format</td>
                                        <td>JSON</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>"""


def build_article(tsx_path: Path) -> str:
    text = tsx_path.read_text(encoding="utf-8")
    fk_body = extract_const_array_block(text, "FILTER_KEYS")
    fr_body = extract_const_array_block(text, "FIELD_REFERENCE")
    filter_keys = [parse_ts_object(o) for o in split_top_level_objects(fk_body)]
    field_reference = [parse_ts_object(o) for o in split_top_level_objects(fr_body)]
    catalog = build_account_field_catalog(filter_keys, field_reference)
    ex_q = extract_template_literal(text, "EXAMPLE_QUERY")
    ex_v = extract_template_literal(text, "EXAMPLE_VARIABLES")
    ex_r = extract_template_literal(text, "EXAMPLE_RESPONSE")
    parts = [
        "",
        render_api_details(),
        render_account_fields_table(catalog),
        render_input_section(),
        render_example_request(ex_q, ex_v),
        render_curl(ex_q, ex_v),
        render_example_response(ex_r),
        render_tips(),
        "",
    ]
    return "\n".join(parts)


def patch_html(html_text: str, new_article_inner: str) -> str:
    start = html_text.find('                    <article class="doc-page-body">')
    if start == -1:
        raise SystemExit("Could not find article start")
    start = html_text.find("\n", start) + 1
    end = html_text.find("                    </article>", start)
    if end == -1:
        raise SystemExit("Could not find article end")
    return html_text[:start] + new_article_inner + html_text[end:]


def patch_description(html_text: str) -> str:
    new = (
        "                        <p class=\"doc-page-description\">\n"
        "                            Fetch a paginated, filtered, and sorted list of accounts enriched with acquisition,\n"
        "                            activation, monetization, engagement, expansion, and firmographic data. Use this endpoint to\n"
        "                            power customer health dashboards, segment-based automations, and CRM exports.\n"
        "                            <code>filters[].key</code> and <code>sort.key</code> must use paths recognized by the\n"
        "                            growth-intelligence account list registry (see <code>accountFieldByGraphQLKey</code> in\n"
        "                            <code>public-api-events</code>).\n"
        "                        </p>"
    )
    if (
        '<code>filters[].key</code> and <code>sort.key</code> must use paths recognized'
        in html_text
    ):
        return html_text
    old = (
        "                        <p class=\"doc-page-description\">\n"
        "                            Fetch a paginated, filtered, and sorted list of accounts enriched with acquisition,\n"
        "                            activation, monetization, engagement, expansion, and firmographic data. Use this endpoint to\n"
        "                            power customer health dashboards, segment-based automations, and CRM exports.\n"
        "                        </p>"
    )
    if old not in html_text:
        raise SystemExit("Could not find doc-page-description block to replace")
    return html_text.replace(old, new, 1)


def patch_toc(html_text: str) -> str:
    new_toc = """                    <a href="#api-details" class="toc-link active">API details</a>
                    <a href="#account-fields" class="toc-link">Account fields</a>
                    <a href="#input" class="toc-link">Input</a>
                    <a href="#filters" class="toc-link">Filters</a>
                    <a href="#filter-operators" class="toc-link">Operators</a>
                    <a href="#sort" class="toc-link">Sort</a>
                    <a href="#pagination" class="toc-link">Pagination</a>
                    <a href="#example-request" class="toc-link">Example request</a>
                    <a href="#curl-example" class="toc-link">cURL</a>
                    <a href="#example-response" class="toc-link">Example response</a>
                    <a href="#tips" class="toc-link">Tips</a>"""
    if 'href="#filterable-keys"' not in html_text and 'href="#account-fields"' in html_text:
        return html_text
    old_toc = """                    <a href="#api-details" class="toc-link active">API details</a>
                    <a href="#input" class="toc-link">Input</a>
                    <a href="#filters" class="toc-link">Filters</a>
                    <a href="#filter-operators" class="toc-link">Operators</a>
                    <a href="#filterable-keys" class="toc-link">Filterable / sortable keys</a>
                    <a href="#sort" class="toc-link">Sort</a>
                    <a href="#pagination" class="toc-link">Pagination</a>
                    <a href="#example-request" class="toc-link">Example request</a>
                    <a href="#curl-example" class="toc-link">cURL</a>
                    <a href="#example-response" class="toc-link">Example response</a>
                    <a href="#full-field-reference" class="toc-link">Full field reference</a>
                    <a href="#tips" class="toc-link">Tips</a>"""
    if old_toc not in html_text:
        raise SystemExit("Could not find TOC block to replace")
    return html_text.replace(old_toc, new_toc, 1)


def main() -> None:
    tsx = Path(sys.argv[1]) if len(sys.argv) > 1 else TSX_DEFAULT
    if not tsx.is_file():
        raise SystemExit(f"TSX not found: {tsx}")
    article = build_article(tsx)
    html_text = HTML_PATH.read_text(encoding="utf-8")
    html_text = patch_description(html_text)
    html_text = patch_toc(html_text)
    html_text = patch_html(html_text, article)
    HTML_PATH.write_text(html_text, encoding="utf-8")
    print(f"Updated {HTML_PATH} from {tsx}")


if __name__ == "__main__":
    main()
