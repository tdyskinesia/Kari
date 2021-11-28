# Kari
Discord youtube stream notification bot for small communities who like a heads up ahead of time.  
  
Not public yet but planning on it.  
  
Will soon scrape instead of using youtube api.  
  
Current Features:  
Upcoming Stream Bulletin w/ Timezones per Channel Sub  
Stream Notifications 15 Minutes Before Detected Streams  
Role Icon Set for Copa Roles  
Membership Verification via Staff Reaction  
  
Planned Features:  
Live Bulletin with Detection for Instant Lives  
Analytics Data for Past Streams  
Live Channel Automatic Name Changes  
  
-----Help-----  
Kari Commands  
  
Administrator Commands	  
k!guildsetup <-n?> - Initial command for setting up server. Use -n flag to disable notifications. (For later features.)	  
	  
Mod Commands	  
k!setup <talent name> <YouTube channel ID> <live channel ID> <roleID> - subs talent to automatic updates	  
k!clearmsgs - clears all scheduled stream notifications	  
k!bupdate <-o?> - forces an update to the bulletin. the -o flag outputs the last saved data to the current channel without using any api requests	  
k!clearsub <live channel ID> - clears a talent from live scheduling	   
k!mrclear <roleID?> (or k!mroleclear) - if no arguments given, clears talent's member role. otherwise changes the member role to given role ID	  
k!mtlist <talent name> - lists all members for given talent name		  
k!mremove <talent name> <userID> - manually removes membership for given user from given talent	  
k!vchset <channelID> - sets a verification channel	  
k!mrole <talent name> <role ID> - sets a member role for a talent	  
k!mtalentsetup <talent name> <membership role ID> <alias_1> <alias_2> ... - Sets up talent only for membership handling. Alias searching not yet implemented for other languages.  	  
	  
Tagger Commands	  
k!timeset <video ID> <minutes> - manually adds minutes to a previously scheduled notification (to use if a stream is manually rescheduled)	  
k!displaysubs - displays current sub list	  
k!displaystreams - displays current upcoming notifications for streams and their rowID for timeset	  
	  
Booster Commands	  
k!seticon <role id> <attachment> - changes role icon for your copa role id (find role id by right clicking your role if you have developer enabled)	  
	  
General Commands	  
k!help - displays this	  
k!github - displays kari github	  
k!mlist - displays your current memberships and the staff who verified them	    
k!member <talent name> <MM/DD/YYYY> <attachment> - adds you to the verification queue. one day before expiration you will recieve a DM notification to update your verification	   
k!ping - pong	  
k!deeznuts - what do you think this does?	  
