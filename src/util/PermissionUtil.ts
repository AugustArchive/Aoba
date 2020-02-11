import { Permission, Constants } from 'eris';

enum Permissions {
  createInstantInvite = 'Create Instant Invite',
  kickMembers = 'Kick Members',
  banMembers = 'Ban Members',
  administrator = 'Administrator',
  manageChannels = 'Manage Channels',
  manageGuild = 'Manage Server',
  addReactions = 'Add Reactions',
  viewAuditLogs = 'View Audit Logs',
  voicePrioritySpeaker = 'Voice Priority Speaker',
  stream = 'Go Live',
  readMessages = 'Read Messages',
  sendMessages = 'Send Messages',
  sendTTSMessages = 'Send TTS Messages',
  manageMessages = 'Manage Messages',
  embedLinks = 'Embed Links',
  attachFiles = 'Attach Files',
  readMessageHistory = 'Read Message History',
  mentionEveryone = 'Mention Everyone',
  externalEmojis = 'External Emojis',
  viewGuildAnalytics = 'View GUild Analytics',
  voiceConnect = 'Connect to a Voice Channel',
  voiceSpeak = 'Speak in a Voice Channel',
  voiceDeafenMembers = 'Deafen Members in a Voice Channel',
  voiceUseVAD = 'Use VAD in Voice Channel',
  changeNickname = 'Change Nicknames',
  manageNicknames = 'Manage Nicknames',
  manageRoles = 'Manage Roles',
  all = 'All Permissions',
  allGuild = 'All Guild Permissions',
  allText = 'All Text Channel Permissions',
  allVoice = 'All Voice Channel Permissions'
}

export class PermissionUtils {
  static toString(perms: number) {
    const permission = new Permission(perms, 0);
    const allPerms: string[] = [];
    for (const perm of Object.keys(permission.json)) allPerms.push(Permissions[perm]);

    return allPerms.join(', ');
  }
}