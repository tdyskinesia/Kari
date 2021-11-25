# Kari
Discord youtube stream notification bot for small communities who like a heads up ahead of time. 

Not public yet but planning on it.

Will soon scrape instead of using youtube api.

Current Features:
Upcoming Stream Bulletin w/ Timezones per Channel Sub
Stream Notifications 15 Minutes Before Detected Streams
Role Icon Set for Copa Roles

Planned Features:
Membership Verification via Staff Reaction
Live Bulletin with Detection for Instant Lives
Analytics Data for Past Streams
Live Channel Automatic Name Changes

::Help::
Kari Commands

Mod Commands
k!setup <talent name> <YouTube channel ID> <live channel id> <role id> - subs talent to automatic updates
k!clearmsgs - clears all scheduled stream notifications
k!bupdate - forces an update to the bulletin
k!clearsub <live channel id> - clears a talent from live scheduling

Tagger Commands
k!timeset <video ID> <minutes> - manually adds minutes to a previously scheduled notification (to use if a stream is manually rescheduled)
k!displaysubs - displays current sub list
k!displaystreams - displays current upcoming notifications for streams and their rowID for timeset

Booster Commands
k!seticon <role id> - changes role icon for your copa role id (find role id by right clicking your role if you have developer enabled)

General Commands
k!help - displays this
k!ping - pong
k!deeznuts - what do you think this does?
