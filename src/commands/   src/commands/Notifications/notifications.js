const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

function hasAdminRole(member) {
    if (!member) return false;
    const hasRole = member.roles.cache.some(r => r.name.toLowerCase() === 'admin');
    const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
    return hasRole || isAdmin;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notificatie')
        .setDescription('Stel YouTube & TikTok notificaties in (alleen admin)')
        .addSubcommandGroup(group => group
            .setName('youtube')
            .setDescription('YouTube notificaties')
            .addSubcommand(sub => sub
                .setName('add')
                .setDescription('Voeg YouTube kanaal toe')
                .addStringOption(o => o.setName('channel_id').setDescription('YouTube Channel ID (UC...)').setRequired(true))
                .addChannelOption(o => o.setName('post_kanaal').setDescription('Waar posten?').addChannelTypes(ChannelType.GuildText).setRequired(true))
            )
            .addSubcommand(sub => sub.setName('remove').setDescription('Verwijder YouTube').addStringOption(o => o.setName('channel_id').setDescription('Channel ID').setRequired(true)))
        )
        .addSubcommandGroup(group => group
            .setName('tiktok')
            .setDescription('TikTok notificaties')
            .addSubcommand(sub => sub
                .setName('add')
