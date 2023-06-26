import { ProcessingStage } from "../config/ActionConfig"
import { RequiredAttachmentConfig } from "../config/AttachmentConfig"
import {
  AttachmentMatchConfig,
  newAttachmentMatchConfig,
  RequiredAttachmentMatchConfig,
} from "../config/AttachmentMatchConfig"
import {
  AttachmentContext,
  AttachmentInfo,
  MessageContext,
  MetaInfo,
  newProcessingResult,
  ProcessingResult,
} from "../Context"
import { PatternUtil } from "../utils/PatternUtil"
import { BaseProcessor } from "./BaseProcessor"

export class AttachmentProcessor extends BaseProcessor {
  public static buildContext(
    ctx: MessageContext,
    info: AttachmentInfo,
  ): AttachmentContext {
    const metaInfo = new MetaInfo()
    const attachmentContext: AttachmentContext = {
      ...ctx,
      attachment: info,
      attachmentMeta: metaInfo,
    }
    attachmentContext.attachmentMeta = this.buildMetaInfo(
      attachmentContext,
      metaInfo,
    )
    attachmentContext.meta = new MetaInfo([
      ...attachmentContext.procMeta,
      ...attachmentContext.threadMeta,
      ...attachmentContext.messageMeta,
      ...attachmentContext.attachmentMeta,
    ])
    return attachmentContext
  }
  public static matches(
    matchConfig: RequiredAttachmentMatchConfig,
    attachment: GoogleAppsScript.Gmail.GmailAttachment,
  ) {
    if (!attachment.getContentType().match(matchConfig.contentType))
      return false
    if (!attachment.getName().match(matchConfig.name)) return false
    if (attachment.getSize() <= matchConfig.largerThan) return false
    if (attachment.getSize() >= matchConfig.smallerThan) return false
    return true
  }

  public static buildMatchConfig(
    ctx: MessageContext,
    global: RequiredAttachmentMatchConfig,
    local: RequiredAttachmentMatchConfig,
  ): RequiredAttachmentMatchConfig {
    return newAttachmentMatchConfig({
      contentType: PatternUtil.substitute(
        ctx,
        `${global.contentType}|${local.contentType}`.replace(".*|", ""),
      ).replace("|.*", ""),
      includeAttachments: global.includeAttachments && local.includeAttachments,
      includeInlineImages:
        global.includeInlineImages && local.includeInlineImages,
      largerThan: Math.max(global.largerThan, local.largerThan),
      name: PatternUtil.substitute(
        ctx,
        `${global.name}|${local.name}`
          .replace("(.*)|", "")
          .replace("|(.*)", ""),
      ),
      smallerThan: Math.min(global.smallerThan, local.smallerThan),
    })
  }

  public static getRegexMapFromAttachmentMatchConfig(
    amc: AttachmentMatchConfig | undefined,
  ): Map<string, string> {
    const m = new Map<string, string>()
    if (amc === undefined) {
      return m
    }
    if (amc.name) m.set("name", amc.name)
    if (amc.contentType) m.set("contentType", amc.contentType)
    return m
  }

  public static buildMetaInfo(
    ctx: AttachmentContext,
    m: MetaInfo = new MetaInfo(),
  ): MetaInfo {
    const attachment = ctx.attachment.object
    m.set("attachment.contentType", attachment.getContentType())
    m.set("attachment.hash", attachment.getHash())
    m.set("attachment.isGoogleType", attachment.isGoogleType())
    m.set("attachment.name", attachment.getName())
    m.set("attachment.size", attachment.getSize())
    m.set("attachment.index", ctx.attachment.index)
    m.set("attachmentConfig.index", ctx.attachment.configIndex)
    const attachmentConfig = ctx.attachment.config
    m = this.buildRegExpSubustitutionMap(
      ctx,
      m,
      "attachment",
      this.getRegexMapFromAttachmentMatchConfig(attachmentConfig.match),
    )
    if (!m.get("attachment.matched")) {
      ctx.log.info(
        `Skipped attachment with name '${attachment.getName()}' because it did not match the regex rules ...`,
      )
    }
    return m
  }

  public static processConfigs(
    ctx: MessageContext,
    configs: RequiredAttachmentConfig[],
    result: ProcessingResult = newProcessingResult(),
  ): ProcessingResult {
    for (let configIndex = 0; configIndex < configs.length; configIndex++) {
      const config = configs[configIndex]
      ctx.log.info(
        `Processing of attachment config '${config.name}' started ...`,
      )
      const opts: GoogleAppsScript.Gmail.GmailAttachmentOptions = {
        includeAttachments: config.match.includeAttachments,
        includeInlineImages: config.match.includeInlineImages,
      }
      const attachments = ctx.message.object.getAttachments(opts)
      const matchConfig = this.buildMatchConfig(
        ctx,
        ctx.proc.config.global.attachment.match,
        config.match,
      )
      for (let index = 0; index < attachments.length; index++) {
        const attachment = attachments[index]
        if (!this.matches(matchConfig, attachment)) {
          ctx.log.debug(
            `Skipping non-matching attachment hash '${attachment.getHash()}' (name:'${attachment.getName()}', type:${attachment.getContentType()}, size:${attachment.getSize()}) started ...`,
          )
          continue
        }
        const attachmentContext = this.buildContext(ctx, {
          config: config,
          configIndex: configIndex,
          index: index,
          object: attachment,
        })
        result = this.processEntity(attachmentContext, result)
      }
      ctx.log.info(`Processing of attachment config '${config.name}' finished.`)
    }
    return result
  }

  public static processEntity(
    ctx: AttachmentContext,
    result: ProcessingResult = newProcessingResult(),
  ): ProcessingResult {
    const attachment = ctx.attachment.object
    ctx.log.info(
      `Processing of attachment hash '${attachment.getHash()}' (name:'${attachment.getName()}', type:${attachment.getContentType()}, size:${attachment.getSize()}) started ...`,
    )
    // Execute pre-main actions:
    result = this.executeActions(
      ctx,
      ProcessingStage.PRE_MAIN,
      result,
      ctx.proc.config.global.attachment.actions,
      ctx.attachment.config.actions,
    )

    // Execute main actions:
    result = this.executeActions(
      ctx,
      ProcessingStage.MAIN,
      result,
      ctx.proc.config.global.attachment.actions,
      ctx.attachment.config.actions,
    )

    // Execute post-main actions:
    result = this.executeActions(
      ctx,
      ProcessingStage.POST_MAIN,
      result,
      ctx.attachment.config.actions,
      ctx.proc.config.global.attachment.actions,
    )
    ctx.log.info(
      `Processing of attachment hash '${attachment.getHash()}' finished.`,
    )
    return result
  }
}
