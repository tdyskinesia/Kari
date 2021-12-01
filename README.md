# Kari
Discord youtube stream notification bot for small communities who like a heads up ahead of time. Also handles membership verification via staff reaction and role icon set for boosters. Created for vtuber fanservers but functionality extends to just about anyone. Much more functionality planned.  
  
DM dyskinesia#5199 if interested in the Kari project and her capabilities.  
  
Currently works off of youtupe api and node-fetch to determine upcoming stream times.   
  
### Current Features:  
+ Upcoming Stream Bulletin w/ Timezones per Channel Sub
+ Live Bulletin with Detection for Instant Lives		
+ Stream Notifications 15 Minutes Before Detected Streams  
+ Role Icon Set for Copa Roles  
+ Membership Verification via Staff Reaction  
+ Live Channel Automatic Name Changes  
  
### Planned Features:    
+ Analytics Data for Past Streams 
+ And more 
  
## Help ##  
### Administrator Commands
+ k!guildsetup - Initial command for setting up server. Follow instructions and re-do if needed.

###Mod Commands
+ k!setup - Initial command for setting up a talent. Follow instructions, answer with "n" on any field to skip it. Re-do if needed.
+ k!clearmsgs - Clears all scheduled stream notifications.
+ k!board - Forces an update to the bulletin.
+ k!clearsub [talent's first or last name] - Clears a talent from server database. BE CAREFUL WITH USE. MAY INVALIDATE MEMBERSHIP DATA.
+ k!mrclear [roleID?] [or k!mroleclear] - If no arguments given, clears talent's member role. Otherwise changes the member role to given role ID.
+ k!mtlist [talent's first or last name] - Lists all members for given talent name.
+ k!mremove [talent's first or last name] [userID] - Manually removes membership for given user from given talent.
+ k!vchset [channelID] - Sets a verification channel.
+ k!mrole [talent\'s first or last name] [role ID] - Sets a member role for a talent.
+ k!mtalentsetup [talent\'s full name] [membership role ID] [alias_1] [alias_2] ... - Sets up talent only for membership handling. Alias searching not yet implemented for other languages.
+ k!brole [roleID?] - If roleID argument is found, sets roleID to the given value. otherwise clears booster role.

### Tagger Commands
+ k!timeset [video ID] [minutes] - Manually adds minutes to a previously scheduled notification (to use if a stream is manually rescheduled). (Deprecated, no reason for use.)
+ k!displaysubs - Displays current sub list. (Deprecated, no reason for use.)
+ k!displaystreams - Displays current upcoming notifications for streams and their rowID for timeset. (Deprecated, no reason for use.)

### Booster Commands
+ k!seticon [role id] [attachment] - Changes role icon for your copa role id (find role id by right clicking your role if you have developer enabled). Only works if the copa role is the highest on the user invoking it.

### General Commands
+ k!help - Displays this.
+ k!github - Displays kari github.
+ k!live - Displays all currently live streams in embeds.
+ k!mlist - Displays your current memberships and the staff who verified them
+ k!member [talent's first or last name] [MM/DD/YYYY] [attachment] - Adds you to the verification queue. One day before expiration you will recieve a DM notification to update your verification.
k!ping - Pong!	  
