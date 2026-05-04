# Graph Report - lunomi  (2026-05-02)

## Corpus Check
- 732 files · ~1,822,409 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6835 nodes · 15374 edges · 99 communities detected
- Extraction: 58% EXTRACTED · 42% INFERRED · 0% AMBIGUOUS · INFERRED: 6433 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 123|Community 123]]
- [[_COMMUNITY_Community 124|Community 124]]
- [[_COMMUNITY_Community 125|Community 125]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 127|Community 127]]
- [[_COMMUNITY_Community 128|Community 128]]
- [[_COMMUNITY_Community 129|Community 129]]
- [[_COMMUNITY_Community 130|Community 130]]
- [[_COMMUNITY_Community 131|Community 131]]
- [[_COMMUNITY_Community 183|Community 183]]
- [[_COMMUNITY_Community 188|Community 188]]
- [[_COMMUNITY_Community 189|Community 189]]
- [[_COMMUNITY_Community 191|Community 191]]
- [[_COMMUNITY_Community 192|Community 192]]
- [[_COMMUNITY_Community 193|Community 193]]

## God Nodes (most connected - your core abstractions)
1. `IncomingMessage` - 379 edges
2. `ProviderConfig` - 251 edges
3. `NimSettings` - 239 edges
4. `MessagesRequest` - 198 edges
5. `TreeQueueManager` - 195 edges
6. `Settings` - 170 edges
7. `SessionStore` - 161 edges
8. `MessageTree` - 161 edges
9. `MessageNode` - 147 edges
10. `Message` - 135 edges

## Surprising Connections (you probably didn't know these)
- `handleWsExec()` --calls--> `String()`  [INFERRED]
  GenericAgent/assets/tmwd_cdp_bridge/background.js → Archon/packages/web/src/components/dashboard/StatusSummaryBar.tsx
- `When API raises during streaming, SSE error event is emitted.` --uses--> `ProviderConfig`  [INFERRED]
  free-claude-code/tests/providers/test_streaming_errors.py → free-claude-code/providers/base.py
- `ReadTimeout(TimeoutError()) should emit a visible, non-empty timeout message.` --uses--> `ProviderConfig`  [INFERRED]
  free-claude-code/tests/providers/test_streaming_errors.py → free-claude-code/providers/base.py
- `Error after partial content: blocks closed, error emitted.` --uses--> `ProviderConfig`  [INFERRED]
  free-claude-code/tests/providers/test_streaming_errors.py → free-claude-code/providers/base.py
- `After a streamed tool_call, do not append error text as a new assistant text blo` --uses--> `ProviderConfig`  [INFERRED]
  free-claude-code/tests/providers/test_streaming_errors.py → free-claude-code/providers/base.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (528): format_user_error_preview(), Truncate a user-facing error string for short chat replies., SSEEvent, Application runtime composition and lifecycle ownership., Run a shutdown step with timeout; never raise to callers., Warn when server auth was implicitly inherited from the shell., Log startup failures without traceback noise unless verbose diagnostics are enab, Return a concise startup failure message for logs and ASGI lifespan failure. (+520 more)

### Community 1 - "Community 1"
Cohesion: 0.01
Nodes (470): ABC, EmittedNativeSseTracker, Parse emitted SSE frames so mid-stream errors can close blocks and pick a fresh, append_request_id(), get_user_facing_error_message(), User-facing error formatting shared by API, providers, and integrations., Return a readable, non-empty error message for users.      Known transport and O, Append request_id suffix when available. (+462 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (379): AbstractResolver, extract_text_from_content(), Extract concatenated text from message content., extract_command_prefix(), extract_filepaths_from_command(), _is_env_assignment(), Command parsing utilities for API optimizations., Return True when a token is a shell-style env assignment. (+371 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (318): CLIAdapter, getLog(), chatCommand(), buildContextPreamble(), continueCommand(), getLog(), loadArtifactSummary(), resolveArtifactsDir() (+310 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (236): test_anthropic_auth_token_accepts_bearer_authorization(), test_anthropic_auth_token_applies_to_models_endpoint(), test_anthropic_auth_token_required_and_accepts_x_api_key(), settings(), NimSettings, Fixed NVIDIA NIM settings (not configurable via env)., Fail fast when removed environment variables are still configured., Let explicit .env auth config override stale shell/client tokens. (+228 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (169): mapMessageRow(), nextId(), formatBytes(), handleInput(), getLog(), isolationCleanupCommand(), isolationCleanupMergedCommand(), isolationCompleteCommand() (+161 more)

### Community 6 - "Community 6"
Cohesion: 0.02
Nodes (167): Record SSE frames completed by ``chunk`` (handles splitting across reads)., SSE content_block ``type`` values for Anthropic web server tools (local handlers, _append_event(), assert_anthropic_stream_contract(), event_index(), event_names(), has_tool_use(), parse_sse_lines() (+159 more)

### Community 7 - "Community 7"
Cohesion: 0.02
Nodes (116): AgentChatMixin, CallbackHandler, AgentChatMixin, allowed_label(), build_done_text(), clean_reply(), extract_files(), format_restore() (+108 more)

### Community 8 - "Community 8"
Cohesion: 0.02
Nodes (114): Track content-block state for native Anthropic SSE strings we emit to clients., Next unused content block index based on emitted starts., Yield ``content_block_stop`` events for blocks that were started but not stopped, Close dangling blocks, emit a text error block at a fresh index, then message ta, ContentBlockManager, format_sse_event(), map_stop_reason(), _normalize_task_run_in_background() (+106 more)

### Community 9 - "Community 9"
Cohesion: 0.02
Nodes (123): _allocate_new_segment(), _delta_type_to_block_kind(), format_native_sse_event(), is_terminal_openrouter_done_event(), parse_native_sse_event(), Shared native Anthropic SSE thinking policy, block remapping, and overlap repair, Close every open block except `current_upstream` and track duplicate upstream st, Assign a new downstream `index` for a segment and record upstream state. (+115 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (120): Shared defaults used by config models and provider adapters., Configuration management., parse_optional_int(), NVIDIA NIM settings (fixed values, no env config)., validate_float_fields(), validate_int_fields(), validate_top_k(), Neutral provider catalog: IDs, credentials, defaults, proxy and capability metad (+112 more)

### Community 11 - "Community 11"
Cohesion: 0.04
Nodes (124): _add_logo_to_cover(), build_epub_async(), BuildState, ChapterCollector, ChapterInfo, collect_folder_files(), convert_internal_links(), CoverGenerationError (+116 more)

### Community 12 - "Community 12"
Cohesion: 0.02
Nodes (109): append_unique(), atomic_write_json(), build_permissions(), load_settings(), main(), parse_args(), test_api_package_exports_match_plan(), test_capability_map_covers_every_public_feature() (+101 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (97): create_asgi_app(), GracefulLifespanApp, FastAPI application factory and configuration., Create the server ASGI app with graceful lifespan failure reporting., ASGI wrapper that reports startup failures without Starlette tracebacks., API layer for Claude Code Proxy., AppRuntime, best_effort() (+89 more)

### Community 14 - "Community 14"
Cohesion: 0.03
Nodes (108): test_parse_cli_event_error_logs_text_when_log_raw_cli_enabled(), CLI integration for Claude Code., CLISessionManager, CLI Session Manager for Multi-Instance Claude CLI Support  Manages a pool of CLI, Remove a session from the manager., Get session statistics., Manages multiple CLISession instances for parallel conversation processing., Initialize the session manager.          Args:             workspace_path: Worki (+100 more)

### Community 15 - "Community 15"
Cohesion: 0.03
Nodes (76): deleteCodebase(), getCodebaseCommands(), getLog(), registerCommand(), updateCodebase(), updateCodebaseCommands(), closeDatabase(), getDatabase() (+68 more)

### Community 16 - "Community 16"
Cohesion: 0.03
Nodes (93): get_block_attr(), get_block_type(), Content block helpers for Anthropic-compatible payloads., Return a content block type when present., Get an attribute from a Pydantic model, lightweight object, or dict., AnthropicToOpenAIConverter, _assert_no_forbidden_assistant_block(), build_base_request_body() (+85 more)

### Community 17 - "Community 17"
Cohesion: 0.04
Nodes (29): _action_btn(), _Badge, _build_prompt_with_uploads(), ChatPanel, FloatingButton, _load_history(), main(), _make_session_id() (+21 more)

### Community 18 - "Community 18"
Cohesion: 0.03
Nodes (70): Tests for format_status., TestFormatStatus, _ctx(), Verify subagent formatting (Task tool)., Verify ordered transcript rendering (thinking/tool/subagent/text/error/status)., Verify simple transcript with just text + status., test_subagents_formatting(), test_transcript_simple() (+62 more)

### Community 19 - "Community 19"
Cohesion: 0.04
Nodes (37): Tests for messaging/rendering/discord_markdown.py., Tests for _normalize_gfm_tables., Tests for render_markdown_to_discord., Tests for escape_discord., Tests for escape_discord_code., Tests for discord_bold., Tests for discord_code_inline., Tests for format_status_discord. (+29 more)

### Community 20 - "Community 20"
Cohesion: 0.06
Nodes (60): fileExists(), getAutodetectPaths(), getLog(), getVendorBinaryName(), resolveCodexBinaryPath(), parseCodexConfig(), buildCodexEnv(), buildModelAccessMessage() (+52 more)

### Community 21 - "Community 21"
Cohesion: 0.05
Nodes (30): Exception, Session, TMWebDriver, sample_incoming(), sample_node(), sample_tree(), test_process_next_triggers_node_started(), test_process_next_triggers_queue_update() (+22 more)

### Community 22 - "Community 22"
Cohesion: 0.05
Nodes (12): DiscordAdapter, getLog(), getLog(), SlackAdapter, parseAllowedUserIds(), getLog(), TelegramAdapter, convertToTelegramMarkdown() (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.07
Nodes (51): MockBlock, MockMessage, MockTool, Top-level reasoning replay avoids duplicating thinking into content., Parametrized system prompt conversion covering edge cases., Parametrized user message conversion., Unknown block types should be silently skipped., Tool use with None input should not crash. (+43 more)

### Community 24 - "Community 24"
Cohesion: 0.07
Nodes (41): create_app(), Create and configure the FastAPI application., _app_settings(), test_app_lifespan_cleanup_continues_if_platform_stop_raises(), test_app_lifespan_flush_pending_save_exception_warning_only(), test_app_lifespan_messaging_import_error_no_crash(), test_app_lifespan_platform_start_exception_cleanup_still_runs(), test_app_lifespan_sets_state_and_cleans_up() (+33 more)

### Community 25 - "Community 25"
Cohesion: 0.09
Nodes (35): _build_step_detail(), _build_user_message(), _card(), _card_raw(), _clean(), create_client(), _describe_media(), _display_text() (+27 more)

### Community 26 - "Community 26"
Cohesion: 0.07
Nodes (32): init(), _load_env_template(), CLI entry points for the installed package., Start the FastAPI server (registered as `free-claude-code` script)., Scaffold config at ~/.config/free-claude-code/.env (registered as `fcc-init`)., Load the canonical root env template from package resources or source., serve(), kill_all_best_effort() (+24 more)

### Community 27 - "Community 27"
Cohesion: 0.1
Nodes (23): getLog(), PostgresAdapter, fileExists(), getLog(), resolveClaudeBinaryPath(), parseClaudeConfig(), applyNodeConfig(), buildBaseClaudeOptions() (+15 more)

### Community 28 - "Community 28"
Cohesion: 0.12
Nodes (20): analyze_directory(), ComplexityAnalyzer, FileMetrics, FunctionMetrics, main(), print_comparison(), print_metrics(), Detect programming language from file extension. (+12 more)

### Community 29 - "Community 29"
Cohesion: 0.09
Nodes (18): parsePiConfig(), parsePiModelRef(), buildBashSpawnHook(), normalizeToThinkingLevel(), resolvePiSkills(), resolvePiThinkingLevel(), resolvePiTools(), skillSearchRoots() (+10 more)

### Community 30 - "Community 30"
Cohesion: 0.1
Nodes (23): _apply_openrouter_reasoning_policy(), build_base_native_anthropic_request_body(), build_openrouter_native_request_body(), dump_raw_messages_request(), _dump_request_fields(), _normalize_system_prompt_for_openrouter(), OpenRouterExtraBodyError, Native Anthropic Messages request body construction (JSON-ready dicts).  Provide (+15 more)

### Community 31 - "Community 31"
Cohesion: 0.13
Nodes (10): _clean(), _dl_media(), extract_text(), is_user_msg(), on_message(), Download & decrypt all media items → list of local file paths., Filter markdown for WeChat rich-text rendering.     WeChat natively renders: cod, _strip_md() (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (23): _importing_package_parts(), _imports_from(), _imports_matching(), _is_forbidden(), _module_fqn_from_path(), Package import contract tests (static AST; dynamic ``importlib`` loads are not s, HTTP layer must not depend on per-adapter provider subpackages., Match root modules (``import api``) and submodules (``import api.x``). (+15 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (18): test_smoke_report_summary_counts_regression_classes(), format_summary(), Summarize smoke JSON reports for local and workflow triage., Read all report JSON files and count outcome classifications., Return a compact human-readable summary., SmokeSummary, summarize_reports(), check_translation_status() (+10 more)

### Community 34 - "Community 34"
Cohesion: 0.1
Nodes (2): getLog(), WebAdapter

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (6): setupWorkflowMocks(), makeConversation(), makeDispatchConversation(), makeWorkflowResult(), makeTestWorkflow(), makeTestWorkflowWithSource()

### Community 36 - "Community 36"
Cohesion: 0.13
Nodes (7): mock_settings(), POST /v1/messages/count_tokens with messages: [] matches messages validation., When get_token_count raises, count_tokens returns 500., POST /v1/messages with messages: [] returns 400 invalid_request_error., test_count_tokens_empty_messages_returns_400(), test_count_tokens_error_returns_500(), test_create_message_empty_messages_returns_400()

### Community 37 - "Community 37"
Cohesion: 0.21
Nodes (8): compare_files(), ComplexityAnalyzer, Compare complexity metrics between two code versions., Analyze code complexity metrics., Calculate cyclomatic complexity using McCabe's method.         Count decision po, Calculate cognitive complexity - how hard is it to understand?         Based on, Maintainability Index ranges from 0-100.         > 85: Excellent         > 65: G, Generate comprehensive complexity report.

### Community 38 - "Community 38"
Cohesion: 0.23
Nodes (2): getLog(), SSETransport

### Community 39 - "Community 39"
Cohesion: 0.22
Nodes (10): buildCdpScript(), buildExecScript(), buildPageScript(), connectWS(), handleBatch(), handleCDP(), handleCookies(), handleExtMessage() (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.34
Nodes (11): count_tokens_estimate(), get_state_file(), handle_stop(), handle_user_prompt_submit(), main(), Get temp file path for storing pre-message token count, isolated by session., Estimate token count using character-based approximation.      Uses ~4 character, Read and concatenate all content from transcript file. (+3 more)

### Community 41 - "Community 41"
Cohesion: 0.21
Nodes (6): AsyncQueue, buildResultChunk(), getLog(), mapPiEvent(), serializeToolResult(), usageToTokens()

### Community 42 - "Community 42"
Cohesion: 0.36
Nodes (11): _settings(), _smoke_config(), test_ollama_provider_configuration_uses_base_url(), test_ollama_provider_matrix_filters_models(), test_provider_smoke_does_not_include_default_local_urls_when_unmapped(), test_provider_smoke_includes_local_provider_when_model_mapping_uses_it(), test_provider_smoke_matrix_filters_provider_catalog(), test_provider_smoke_model_override_accepts_model_name_without_prefix() (+3 more)

### Community 43 - "Community 43"
Cohesion: 0.4
Nodes (12): Add-ToUserPath(), Confirm-Checksum(), Get-Arch(), Get-ChecksumsUrl(), Get-DownloadUrl(), Invoke-Download(), Main(), Show-Banner() (+4 more)

### Community 44 - "Community 44"
Cohesion: 0.4
Nodes (12): Add-ToUserPath(), Confirm-Checksum(), Get-Arch(), Get-ChecksumsUrl(), Get-DownloadUrl(), Invoke-Download(), Main(), Show-Banner() (+4 more)

### Community 45 - "Community 45"
Cohesion: 0.24
Nodes (9): Click(), FindBlock(), GetWRect(), MouseClick(), MouseDClick(), MouseDown(), MouseUp(), CRITICAL: 严禁在此工具链中 import pyautogui (会污染 win32api 导致逻辑冲突)。 ljqCtrl Quick Referen (+1 more)

### Community 46 - "Community 46"
Cohesion: 0.17
Nodes (8): unregister_pid(0) is a no-op., Second call to ensure_atexit_registered is idempotent., Exception in os.kill/taskkill is logged but does not raise., register_pid(0) is a no-op (early return)., test_process_registry_ensure_atexit_idempotent(), test_process_registry_kill_all_exception_logged_no_raise(), test_process_registry_register_pid_zero_noop(), test_process_registry_unregister_pid_zero_noop()

### Community 47 - "Community 47"
Cohesion: 0.18
Nodes (11): complete_task(), get_history(), get_todo(), _next_report_number(), autonomous_task.py - 自主行动任务管理API 放置: memory/autonomous_operation_sop/ 用法: import, 扫 history.txt 第一行提取最大 RXX 编号，返回下一个, 返回 TODO.txt 的内容。若文件不存在返回提示。, 返回 history.txt 的前 n 行（最新在前）。 (+3 more)

### Community 48 - "Community 48"
Cohesion: 0.18
Nodes (1): repository()

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (6): APIDocExtractor, generate_markdown_docs(), Extract function documentation., Extract return type from function annotation., Generate markdown documentation from endpoints., Extract API documentation from Python source code.

### Community 50 - "Community 50"
Cohesion: 0.35
Nodes (2): getLog(), SqliteAdapter

### Community 51 - "Community 51"
Cohesion: 0.2
Nodes (2): useProviders(), ProviderField()

### Community 52 - "Community 52"
Cohesion: 0.24
Nodes (6): getDebouncedIssues(), getInstantIssues(), useBuilderValidation(), dagNodesToReactFlow(), hasCycle(), layoutWithDagre()

### Community 53 - "Community 53"
Cohesion: 0.31
Nodes (7): _dump_native(), _dump_u2(), _parse_xml(), 用uiautomator2 dump，不受idle限制, 原生uiautomator dump（需idle状态）, 一键dump+解析Android UI (u2优先)     keyword: 过滤含关键词的节点     clickable_only: 只显示可点击节点, ui()

### Community 54 - "Community 54"
Cohesion: 0.39
Nodes (6): getWorkflowCategory(), getWorkflowDisplayName(), getWorkflowIconName(), getWorkflowTags(), parseWorkflowDescription(), WorkflowCard()

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (2): escapeHtml(), loginPage()

### Community 57 - "Community 57"
Cohesion: 0.25
Nodes (1): Opt-in Langfuse tracing. Self-activates on import if langfuse_config exists in m

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (1): Tests for check_cross_references.py — focus on repo-root boundary.

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (2): makeDeps(), makeStore()

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (1): MockIsolationResolver

### Community 63 - "Community 63"
Cohesion: 0.52
Nodes (6): ask_vision(), _call_claude(), _call_openai_compat(), _load_config(), _prepare_image(), 加载+缩放+base64编码，返回b64字符串

### Community 64 - "Community 64"
Cohesion: 0.53
Nodes (5): heading_to_anchor(), iter_md_files(), main(), Remove fenced code blocks and inline code spans to avoid scanning example links., strip_code_blocks()

### Community 66 - "Community 66"
Cohesion: 0.33
Nodes (1): ErrorBoundary

### Community 68 - "Community 68"
Cohesion: 0.4
Nodes (2): makeDeps(), makeStore()

### Community 69 - "Community 69"
Cohesion: 0.6
Nodes (5): collectFiles(), ensureDir(), main(), renderFile(), renderRecord()

### Community 70 - "Community 70"
Cohesion: 0.6
Nodes (5): build_rules(), format_llm_context(), is_hex_pattern(), MEMORY_BASIC_INFORMATION, scan_memory()

### Community 72 - "Community 72"
Cohesion: 0.6
Nodes (3): createResolver(), makeMockProvider(), makeMockStore()

### Community 74 - "Community 74"
Cohesion: 0.5
Nodes (2): scriptedAgentEnd(), scriptedAssistantThenEnd()

### Community 76 - "Community 76"
Cohesion: 0.4
Nodes (2): useProject(), NodePalette()

### Community 80 - "Community 80"
Cohesion: 0.5
Nodes (2): createMockDeps(), createMockStore()

### Community 81 - "Community 81"
Cohesion: 0.7
Nodes (4): detect_ui_elements(), main(), ocr_text(), visualize()

### Community 83 - "Community 83"
Cohesion: 0.5
Nodes (1): preReview()

### Community 84 - "Community 84"
Cohesion: 0.5
Nodes (1): postDeploy()

### Community 85 - "Community 85"
Cohesion: 0.5
Nodes (1): preDeploy()

### Community 86 - "Community 86"
Cohesion: 0.5
Nodes (2): analyze_code_metrics(), Analyze code for common metrics.

### Community 87 - "Community 87"
Cohesion: 0.67
Nodes (2): check_url(), is_skipped()

### Community 92 - "Community 92"
Cohesion: 0.67
Nodes (2): handleBuilderKeydown(), isInputTarget()

### Community 93 - "Community 93"
Cohesion: 0.83
Nodes (3): categorizeCommands(), findCategory(), stripArchonPrefix()

### Community 94 - "Community 94"
Cohesion: 0.83
Nodes (3): normalizeCheckName(), parseResultCell(), parseValidationResults()

### Community 97 - "Community 97"
Cohesion: 0.5
Nodes (1): MockPlatformAdapter

### Community 99 - "Community 99"
Cohesion: 0.67
Nodes (2): _d(), _run()

### Community 101 - "Community 101"
Cohesion: 1.0
Nodes (2): makeMockProvider(), makeMockRegistration()

### Community 102 - "Community 102"
Cohesion: 0.67
Nodes (1): UnknownProviderError

### Community 104 - "Community 104"
Cohesion: 0.67
Nodes (1): createMockLogger()

### Community 123 - "Community 123"
Cohesion: 0.67
Nodes (1): Archon

### Community 124 - "Community 124"
Cohesion: 1.0
Nodes (1): Claude Code Proxy - Entry Point  Minimal entry point that builds the ASGI app vi

### Community 125 - "Community 125"
Cohesion: 1.0
Nodes (1): Re-exports default upstream base URLs from the config provider catalog.

### Community 126 - "Community 126"
Cohesion: 1.0
Nodes (1): Markdown rendering utilities for messaging platforms.

### Community 127 - "Community 127"
Cohesion: 1.0
Nodes (1): Local-only live smoke tests for free-claude-code.

### Community 128 - "Community 128"
Cohesion: 1.0
Nodes (1): Live prerequisite checks for product smoke.

### Community 129 - "Community 129"
Cohesion: 1.0
Nodes (1): Shared helpers for local-only smoke tests.

### Community 130 - "Community 130"
Cohesion: 1.0
Nodes (1): Product-level end-to-end smoke scenarios.

### Community 131 - "Community 131"
Cohesion: 1.0
Nodes (1): Neutral shared application core.

### Community 183 - "Community 183"
Cohesion: 1.0
Nodes (1): CustomError

### Community 188 - "Community 188"
Cohesion: 1.0
Nodes (1): Read stderr concurrently with stdout to avoid subprocess pipe deadlocks.

### Community 189 - "Community 189"
Cohesion: 1.0
Nodes (1): Check if a task is currently running.

### Community 191 - "Community 191"
Cohesion: 1.0
Nodes (1): Test proactive throttling.         Logic ported from verify_provider_limiter.py

### Community 192 - "Community 192"
Cohesion: 1.0
Nodes (1): Convert user list blocks, emitting deferred assistant after all tool results.

### Community 193 - "Community 193"
Cohesion: 1.0
Nodes (1): Whether currently inside a think tag.

## Knowledge Gaps
- **565 isolated node(s):** `Claude Code Proxy - Entry Point  Minimal entry point that builds the ASGI app vi`, `Release any resources held by this provider.`, `Return the model ids currently advertised by this provider.`, `Stream response in Anthropic SSE format.`, `Re-exports default upstream base URLs from the config provider catalog.` (+560 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 34`** (21 nodes): `getLog()`, `WebAdapter`, `.constructor()`, `.emitLockEvent()`, `.emitRetract()`, `.emitSSE()`, `.ensureThread()`, `.getPlatformType()`, `.getStreamingMode()`, `.hasActiveStream()`, `.registerOutputCallback()`, `.registerStream()`, `.removeOutputCallback()`, `.removeStream()`, `.sendMessage()`, `.sendStructuredEvent()`, `.setConversationDbId()`, `.setupEventBridge()`, `.start()`, `.stop()`, `web.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (15 nodes): `transport.ts`, `getLog()`, `SSETransport`, `.bufferEvent()`, `.clearBuffer()`, `.constructor()`, `.emit()`, `.emitWorkflowEvent()`, `.hasActiveStream()`, `.registerStream()`, `.removeStream()`, `.scheduleCleanup()`, `.start()`, `.stop()`, `.writeToStream()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (11 nodes): `test_tree_repository.py`, `repository()`, `test_add_and_get_tree()`, `test_all_trees()`, `test_get_node()`, `test_get_queue_size()`, `test_get_tree_nonexistent()`, `test_is_tree_busy()`, `test_register_node()`, `test_resolve_parent_node_id()`, `test_to_from_dict()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (11 nodes): `getLog()`, `SqliteAdapter`, `.close()`, `.constructor()`, `.convertPlaceholders()`, `.createSchema()`, `.initSchema()`, `.migrateColumns()`, `.query()`, `.withTransaction()`, `sqlite.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (10 nodes): `NodeInspector.tsx`, `useProviders.ts`, `useProviders()`, `Field()`, `handleAdd()`, `handleModeChange()`, `handleRemove()`, `parseToolsList()`, `ProviderField()`, `resolveToolsMode()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (8 nodes): `server.js`, `escapeHtml()`, `isSafeRedirect()`, `loginPage()`, `parseCookies()`, `readBody()`, `signCookie()`, `verifyCookie()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (8 nodes): `langfuse_tracing.py`, `_extract_usage()`, `_patched_after()`, `_patched_before()`, `_patched_log()`, `_patched_loop()`, `Opt-in Langfuse tracing. Self-activates on import if langfuse_config exists in m`, `_wrap_parser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (7 nodes): `test_check_cross_references.py`, `Tests for check_cross_references.py — focus on repo-root boundary.`, `repo()`, `test_broken_in_repo_link_is_reported()`, `test_links_escaping_repo_root_are_skipped()`, `test_numbered_lesson_dir_missing_readme_is_reported()`, `test_valid_in_repo_link_passes()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (7 nodes): `executor-preamble.test.ts`, `findMessage()`, `makeDeps()`, `makePlatform()`, `makeRun()`, `makeStore()`, `makeWorkflow()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (7 nodes): `orchestrator-isolation.test.ts`, `constructor()`, `makeCodebase()`, `makeConversation()`, `makeEnvRow()`, `MockIsolationResolver`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (6 nodes): `App.tsx`, `ErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (6 nodes): `executor.test.ts`, `makeDeps()`, `makePlatform()`, `makeRun()`, `makeStore()`, `makeWorkflow()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (5 nodes): `provider.test.ts`, `consume()`, `resetScript()`, `scriptedAgentEnd()`, `scriptedAssistantThenEnd()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (5 nodes): `NodePalette.tsx`, `ProjectContext.tsx`, `ProjectProvider()`, `useProject()`, `NodePalette()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (5 nodes): `script-node-deps.test.ts`, `createMockDeps()`, `createMockPlatform()`, `createMockStore()`, `makeWorkflowRun()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (4 nodes): `pre-review.js`, `pre-review.js`, `pre-review.js`, `preReview()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (4 nodes): `post-deploy.js`, `post-deploy.js`, `post-deploy.js`, `postDeploy()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (4 nodes): `pre-deploy.js`, `pre-deploy.js`, `pre-deploy.js`, `preDeploy()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (4 nodes): `analyze-metrics.py`, `analyze-metrics.py`, `analyze_code_metrics()`, `Analyze code for common metrics.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (4 nodes): `check_links.py`, `check_url()`, `is_skipped()`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (4 nodes): `useBuilderKeyboard.ts`, `handleBuilderKeydown()`, `isInputTarget()`, `useBuilderKeyboard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (4 nodes): `platform.ts`, `createMockPlatform()`, `MockPlatformAdapter`, `.reset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (4 nodes): `_d()`, `_pinit()`, `_run()`, `code_run_header.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 101`** (3 nodes): `registry.test.ts`, `makeMockProvider()`, `makeMockRegistration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (3 nodes): `errors.ts`, `UnknownProviderError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (3 nodes): `logger.ts`, `logger.ts`, `createMockLogger()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 123`** (3 nodes): `archon.rb`, `Archon`, `.install()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 124`** (2 nodes): `server.py`, `Claude Code Proxy - Entry Point  Minimal entry point that builds the ASGI app vi`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 125`** (2 nodes): `defaults.py`, `Re-exports default upstream base URLs from the config provider catalog.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (2 nodes): `__init__.py`, `Markdown rendering utilities for messaging platforms.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 127`** (2 nodes): `__init__.py`, `Local-only live smoke tests for free-claude-code.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 128`** (2 nodes): `__init__.py`, `Live prerequisite checks for product smoke.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 129`** (2 nodes): `__init__.py`, `Shared helpers for local-only smoke tests.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 130`** (2 nodes): `__init__.py`, `Product-level end-to-end smoke scenarios.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 131`** (2 nodes): `Neutral shared application core.`, `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 183`** (2 nodes): `error.test.ts`, `CustomError`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 188`** (1 nodes): `Read stderr concurrently with stdout to avoid subprocess pipe deadlocks.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 189`** (1 nodes): `Check if a task is currently running.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 191`** (1 nodes): `Test proactive throttling.         Logic ported from verify_provider_limiter.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 192`** (1 nodes): `Convert user list blocks, emitting deferred assistant after all tool results.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 193`** (1 nodes): `Whether currently inside a think tag.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ProviderConfig` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 6`, `Community 12`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `listWorktrees()` connect `Community 5` to `Community 8`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `IncomingMessage` connect `Community 0` to `Community 21`, `Community 13`, `Community 6`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Are the 376 inferred relationships involving `IncomingMessage` (e.g. with `Platform-agnostic messaging layer.` and `Command parsing and dispatch for messaging handlers.`) actually correct?**
  _`IncomingMessage` has 376 INFERRED edges - model-reasoned connections that need verification._
- **Are the 248 inferred relationships involving `ProviderConfig` (e.g. with `ProviderModelInfo` and `Providers package - implement your own provider by extending BaseProvider.  Conc`) actually correct?**
  _`ProviderConfig` has 248 INFERRED edges - model-reasoned connections that need verification._
- **Are the 236 inferred relationships involving `NimSettings` (e.g. with `NvidiaNimProvider` and `NVIDIA NIM provider implementation.`) actually correct?**
  _`NimSettings` has 236 INFERRED edges - model-reasoned connections that need verification._
- **Are the 196 inferred relationships involving `MessagesRequest` (e.g. with `Request detection utilities for API optimizations.  Detects quota checks, title` and `Check if this is a quota probe request.      Quota checks are typically simple r`) actually correct?**
  _`MessagesRequest` has 196 INFERRED edges - model-reasoned connections that need verification._