const db = require('../utils/database');
const { EmbedBuilder } = require('discord.js');

async function getLatestYouTubeVideo(channelId) {
    try {
        const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
        const text = await res.text();
        const id = text.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
        if (!id) return null;
        return { id, url: `https://www.youtube.com/watch?v=${id}` };
    } catch { return null; }
}

async function getLatestTikTok(username) {
    try {
        const res = await fetch(`https://www.tikwm.com/api/user/posts?unique_id=${username}&count=1`);
        const json = await res.json();
        const vid = json.data?.videos?.[0];
        if (!vid) return null;
        return { 
          id: vid.video_id, 
          url: `https://www.tiktok.com/@${username}/video/${vid.video_id}`, 
          title: vid.title, 
          cover: vid.cover 
        };
    } catch { return null; }
}

function startSocialNotifications(client) {
    console.log('[SocialNotify] Gestart - checkt elke 5 min');
    setInterval(async () => {
        for (const [guildId, guild] of client.guilds.cache) {
            
            // YOUTUBE CHECK
            const ytList = await db.get(`guild:${guildId}:notifications:youtube`) || [];
            for (let e of ytList) {
                const latest = await getLatestYouTubeVideo(e.channelId);
                if (!latest || e.lastVideoId === latest.id) continue;
                e.lastVideoId = latest.id;
                const ch = guild.channels.cache.get(e.postChannelId);
                if (ch) ch.send(`🎥 Nieuwe YouTube video! ${latest.url}`).catch(()=>{});
            }
            if (ytList.length) await db.set(`guild:${guildId}:notifications:youtube`, ytList);

            // TIKTOK CHECK
            const ttList = await db.get(`guild:${guildId}:notifications:tiktok`) || [];
            for (let e of ttList) {
                const latest = await getLatestTikTok(e.username);
                if (!latest || e.lastVideoId === latest.id) continue;
                e.lastVideoId = latest.id;
                const ch = guild.channels.cache.get(e.postChannelId);
                if (ch) ch.send(`🎵 Nieuwe TikTok van @${e.username}! ${latest.url}`).catch(()=>{});
            }
            if (ttList.length) await db.set(`guild:${guildId}:notifications:tiktok`, ttList);
        }
    }, 5 * 60 * 1000); // 5 minuten
}

module.exports = { startSocialNotifications };
