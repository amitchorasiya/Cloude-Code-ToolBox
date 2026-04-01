package com.amitchorasiya.cloude.toolbox.intellij.wizard

import com.amitchorasiya.cloude.toolbox.intellij.cli.BundledBridgeCli
import com.amitchorasiya.cloude.toolbox.intellij.cli.ToolboxNodeRunner
import com.amitchorasiya.cloude.toolbox.intellij.hub.CloudeHubBridge
import com.amitchorasiya.cloude.toolbox.intellij.hub.HubFileOpener
import com.amitchorasiya.cloude.toolbox.intellij.intelligence.McpSkillsAwarenessIntellij
import com.amitchorasiya.cloude.toolbox.intellij.intelligence.ReadinessIntellij
import com.amitchorasiya.cloude.toolbox.intellij.parity.ClaudeToolboxConfigScanIntellij
import com.amitchorasiya.cloude.toolbox.intellij.parity.AppendCursorrulesIntellij
import com.amitchorasiya.cloude.toolbox.intellij.parity.MergeCopilotInstructionsIntellij
import com.amitchorasiya.cloude.toolbox.intellij.parity.RunFirstTestTaskIntellij
import com.amitchorasiya.cloude.toolbox.intellij.settings.OneClickSetupModel
import com.amitchorasiya.cloude.toolbox.intellij.settings.ToolboxSettings
import com.amitchorasiya.cloude.toolbox.intellij.skills.MigrateSkillMode
import com.amitchorasiya.cloude.toolbox.intellij.skills.SkillsCursorToAgentsMigration
import com.intellij.notification.Notification
import com.intellij.notification.NotificationAction
import com.intellij.notification.NotificationType
import com.intellij.notification.Notifications
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.Project
import java.nio.file.Path
import java.nio.file.Paths

/**
 * Executes One Click Setup in the same order as
 * [packages/cloude-code-toolbox/src/commands/oneClickSetup.ts].
 */
object OneClickSetupRunner {

    fun run(project: Project, model: OneClickSetupModel) {
        val basePath = project.basePath ?: run {
            notify(project, "Open a workspace folder first.", NotificationType.WARNING)
            return
        }
        val base = Paths.get(basePath)
        val home = Paths.get(System.getProperty("user.home"))
        var settings = ToolboxSettings(base)
        val bridge = project.getService(CloudeHubBridge::class.java)
        val notes = mutableListOf<String>()

        settings.setOneClickSetup(model)

        try {
            // --- Cursor → Claude Code ---
            val migrateCursorSkills = model.migrateFromCursor && model.migrateSkillsTarget != "off"
            if (migrateCursorSkills) {
                val mode = if (model.migrateSkillsMode == "move") MigrateSkillMode.MOVE else MigrateSkillMode.COPY
                when (model.migrateSkillsTarget) {
                    "workspace" -> {
                        val r = SkillsCursorToAgentsMigration.runForRoot(base, mode)
                        if (r.errors > 0) notes.add("[Cursor] skills: ${r.errors} error(s) under ${r.skillsSourcePath}")
                    }
                    "user" -> {
                        val r = SkillsCursorToAgentsMigration.runForRoot(home, mode)
                        if (r.errors > 0) notes.add("[Cursor] skills: ${r.errors} error(s) under ${r.skillsSourcePath}")
                    }
                    "both" -> {
                        val r1 = SkillsCursorToAgentsMigration.runForRoot(base, mode)
                        val r2 = SkillsCursorToAgentsMigration.runForRoot(home, mode)
                        if (r1.errors > 0) notes.add("[Cursor] skills: ${r1.errors} error(s) under ${r1.skillsSourcePath}")
                        if (r2.errors > 0) notes.add("[Cursor] skills: ${r2.errors} error(s) under ${r2.skillsSourcePath}")
                    }
                }
                bridge.refreshHub()
            }

            val syncRules = model.migrateFromCursor && model.syncCursorRulesMode != "off"
            if (syncRules) {
                val args = mutableListOf("--cwd", base.toString())
                if (model.syncCursorRulesMode == "dryRun") {
                    args.add("--dry-run")
                }
                val err = ToolboxNodeRunner.runBundledToolboxBridge(
                    project,
                    base,
                    BundledBridgeCli.CURSOR_RULES_TO_CLAUDE,
                    args,
                    "Cursor rules → CLAUDE.md",
                    settings,
                )
                err?.let { notes.add("[Cursor] rules: $it") }
                bridge.refreshHub()
            }

            if (model.migrateFromCursor && model.appendCursorrules) {
                if (!AppendCursorrulesIntellij.mergeSilent(project)) {
                    /* no .cursorrules — skip quietly */
                }
            }

            if (model.migrateFromCursor) {
                val portArgs = portCursorMcpArgs(settings, model.portCursorMcp)
                if (portArgs != null) {
                    val err = ToolboxNodeRunner.runBundledToolboxBridge(
                        project,
                        base,
                        BundledBridgeCli.CURSOR_MCP_PORT,
                        portArgs,
                        "Cursor MCP port",
                        settings,
                    )
                    err?.let { notes.add("[Cursor] MCP port: $it") }
                    bridge.refreshHub()
                }
            }

            // --- GitHub Copilot → Claude Code ---
            if (model.migrateFromGitHubCopilot && model.mergeCopilotInstructionsIntoClaudeMd) {
                if (!MergeCopilotInstructionsIntellij.mergeSilent(project)) {
                    notes.add("[Copilot] skip: .github/copilot-instructions.md missing or empty")
                }
            }

            val migrateCopilotSkills =
                model.migrateFromGitHubCopilot && model.migrateCopilotSkillsTarget != "off"
            if (migrateCopilotSkills) {
                val mode = if (model.migrateCopilotSkillsMode == "move") MigrateSkillMode.MOVE else MigrateSkillMode.COPY
                when (model.migrateCopilotSkillsTarget) {
                    "workspace" -> {
                        val r = SkillsCursorToAgentsMigration.runForGithubSkillsRoot(base, mode)
                        if (r.errors > 0) notes.add("[Copilot] skills: ${r.errors} error(s) under ${r.skillsSourcePath}")
                    }
                    "user" -> {
                        val r = SkillsCursorToAgentsMigration.runForUserCopilotSkills(home, mode)
                        if (r.errors > 0) notes.add("[Copilot] skills: ${r.errors} error(s) under ${r.skillsSourcePath}")
                    }
                    "both" -> {
                        val r1 = SkillsCursorToAgentsMigration.runForGithubSkillsRoot(base, mode)
                        val r2 = SkillsCursorToAgentsMigration.runForUserCopilotSkills(home, mode)
                        if (r1.errors > 0) notes.add("[Copilot] skills: ${r1.errors} error(s) under ${r1.skillsSourcePath}")
                        if (r2.errors > 0) notes.add("[Copilot] skills: ${r2.errors} error(s) under ${r2.skillsSourcePath}")
                    }
                }
                bridge.refreshHub()
            }

            // --- Shared: memory bank ---
            val initMb = model.initMemoryBankMode != "off"
            if (initMb) {
                val args = mutableListOf("init", "--cwd", base.toString())
                when (model.initMemoryBankMode) {
                    "dryRun" -> args.add("--dry-run")
                }
                if (model.migrateFromCursor && model.initMemoryBankCursorRules) {
                    args.add("--cursor-rules")
                }
                val err = ToolboxNodeRunner.runBundledToolboxBridge(
                    project,
                    base,
                    BundledBridgeCli.CLOUDE_CODE_MEMORY_BANK,
                    args,
                    "Memory bank init",
                    settings,
                )
                err?.let { notes.add("Memory bank: $it") }
                bridge.refreshHub()
            }

            if (model.instructionMergeAfterOneClick == "enableAutoScan") {
                settings.setAutoScanMcpSkills(true)
            }
            settings = ToolboxSettings(base)

            if (model.runAwarenessScan) {
                val forceOnce = model.instructionMergeAfterOneClick == "mergeClaudeMdOnce"
                val shouldMerge =
                    settings.getAutoScanMcpSkills() || forceOnce
                McpSkillsAwarenessIntellij.runScan(
                    project,
                    mergeIntoClaudeMd = shouldMerge,
                    openAwarenessInEditor = false,
                )
            }

            if (model.runReadiness) {
                ReadinessIntellij.runAndOpenReport(project)
            }

            if (model.runConfigScan) {
                ClaudeToolboxConfigScanIntellij.run(project, settings)
            }

            if (model.runFirstTestTask) {
                RunFirstTestTaskIntellij.run(project, base)
            }

            bridge.refreshHub()

            if (model.migrateFromGitHubCopilot && model.copilotMcpReminderAfterOneClick) {
                val n = Notification(
                    "CloudeCodeToolBox",
                    "Cloude Code ToolBox",
                    "VS Code `mcp.json` is for the editor; Claude Code uses `/mcp` in the Claude panel. Align servers in both places if needed.",
                    NotificationType.INFORMATION,
                )
                n.addAction(object : NotificationAction("Open user mcp.json") {
                    override fun actionPerformed(e: AnActionEvent, notification: Notification) {
                        HubFileOpener.openUserMcp(project)
                    }
                })
                Notifications.Bus.notify(n, project)
            }

            val msg = if (notes.isNotEmpty()) {
                "One Click Setup finished. Notes: ${notes.joinToString(" · ")}"
            } else {
                "One Click Setup finished. Review Run tool windows, opened scans, and CLAUDE.md."
            }
            notify(project, msg, NotificationType.INFORMATION)
        } catch (e: Exception) {
            notify(project, "One Click Setup failed: ${e.message}", NotificationType.ERROR)
        }
    }

    private fun portCursorMcpArgs(settings: ToolboxSettings, mode: String): List<String>? =
        when (mode) {
            "skip" -> null
            "dry" -> listOf("--dry-run")
            "user" -> listOf("-t", if (settings.getUseInsidersPaths()) "insiders" else "user")
            "workspaceOverwrite", "workspaceMerge" -> emptyList()
            else -> listOf("-t", if (settings.getUseInsidersPaths()) "insiders" else "user")
        }

    private fun notify(project: Project, text: String, type: NotificationType) {
        Notifications.Bus.notify(Notification("CloudeCodeToolBox", "Cloude Code ToolBox", text, type), project)
    }
}
