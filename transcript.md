Speaker A: So right now, this is one shot.
Speaker B: Yeah.
Speaker A: This is another shot.
Speaker C: Right.
Speaker A: You can see, like, the camera angle changes. It should be able to detect that. But this is a better detection. But, like, where it's like, this is one shot. This is another shot. This is like three shots. So, like, that's three shots. So that's another thing. Let me get a pencil.
Speaker B: Okay.
Speaker A: Let me get my notes. Another.
Speaker D: Another thing we could do is we can. So we have pupillometry from a desktop camera, so that can track eye patterns. Then we can do.
Speaker B: Don't do too much.
Speaker D: Too much.
Speaker B: I think, like, even the brain wave itself is such a strong point. Okay. Yeah. And how your brain wave, like, just changes during different shots.
Speaker C: Okay.
Speaker B: Like, if they ask you what you're gonna do in the future, how do you. And you can. Like, even when you demo, we're gonna be a little bit crazy, Right. We're also thinking about incremental eye tracking. Yeah.
Speaker A: I think the best way.
Speaker D: Wait, Devin, do you have a skill file for pupilometry? Did you. Did you make it? What's desktop I. Video tracking?
Speaker A: That's a lot then.
Speaker C: Okay.
Speaker A: I think the focus on the EG, because everyone can do eye tracking. It's like, very easy to do.
Speaker B: Yeah.
Speaker D: You know what to make the. Okay, I understand. Maybe I'm taking it too robustly
Speaker B: because for YC demo, you just gotta be crazy. Catch the eye.
Speaker A: I think just eeg. No one's done this before. Everyone can do eye tracking.
Speaker B: Yeah.
Speaker A: And it's like, it's a lot of work. A little bit invasive too. So 350 videos. Okay.
Speaker B: Could you talk everything you just said?
Speaker A: Yeah, I'll say everything. Okay. So after that we have all these videos, right.
Speaker C: Boom.
Speaker A: They have some waveform. Video waveform. Video waveform. Right. After that, what are the elements that we really use to train this model? Right. So the main things that we. The main thing we want, the output of our model should be this waveform or the input of our model should be video and the output should be waveform. Yeah. And then after that, we can have like, some AI decode this waveform into, like, natural language and be like, it has these characteristics. So decode the waveform. And then it has some. Has like a scoring chart. So it has some score. 0 out of 10. And the score can be based off of components such as, you know, this, this, this, this, this. So what are the components from this video? How this model is going to. The characteristics we can immediately get from are the text via transcription. We can see the Scene and cuts. So is it a fast cut edit, you know, with like a bunch of like, you know, like a montage of some sort? We can see alongside this the text in the scene. Just like the audio envelope generally. Is there music in the background? Is it like wide range? Is it just someone talking? So this audio generally, is it a really. Is it like a music based clip? Is it a specific clip like that? What else can. What else is like a. This video text subtitle? Like visual elements? Like, like not visual elements, but obviously like overlaid elements like subtitles, other.
Speaker B: Are we all gonna include this in for training? A model?
Speaker A: So this is what we're gonna do. So every video that we're gonna. At least 50 videos will have all these characteristics to some degree.
Speaker C: Right?
Speaker B: Okay.
Speaker A: So when we collect these 50 videos, we'll break up these characteristics. Right, Gotcha. We'll be like, okay, this is, this is the text that was in this video. This was the amount of scenes. This was what the audio was like. This is what the sub. If they had subtitles.
Speaker C: Yes. No.
Speaker A: And then after that we'll see. Then with these, these are all our inputs. And then this had some waveform like this. And then after that waveform, we can like decode it and be like, okay, it's like a basic scoring.
Speaker B: I know, I know what you mean.
Speaker A: But not too much. ML.
Speaker B: Can we have like just take a look online? Do we have an existing model?
Speaker D: Yeah, that's what happens.
Speaker B: Yeah. Because if we do have done some of the elements here, it will be much easier.
Speaker A: Yeah, exactly. Yeah.
Speaker B: We can still say, wait, so now
Speaker D: the biggest concern is that, yes, we get a pre existing model. Do we have a. Do we have an artifact rejection layer that we have to make?
Speaker A: What do you mean?
Speaker D: An artifact rejection layer. For us, we device to take out any EMG signaling, meaning like electromyography. So like muscular activation.
Speaker B: So they won't be able to understand that.
Speaker C: They don't.
Speaker A: That's like.
Speaker D: No, they don't. This is internal. This is internal. It's fine.
Speaker A: Just like be quiet.
Speaker B: It requires just like. They don't even know what, what does that mean when they see the wave? If you just held them, it's like the brain wave.
Speaker D: But the reason I'm asking is because we have all of this. Do you. Can you make a skills file with the artifact injection layer?
Speaker A: Is it in, Is it in the thing? Then it'll be everything that we have right now.
Speaker D: Just be very careful about ip.
Speaker A: I. I made a skill. It's like a one Layer. It's actually a big issue, this skill file thing. Because like if you're at some company, you can just be like, oh, make a skill of my entire company. And then you just take that, you print that file out, go somewhere else and then like that's a big issue. I just, I just thought about that, like. No, but it's nothing. It's nothing crazy because it's just, it's all from the open BCI website.
Speaker C: Okay.
Speaker A: It's not like, are you gonna use
Speaker B: that skill in our new repo?
Speaker A: Yeah, just like we can do everything from the doc, from the actual docs.
Speaker B: Okay.
Speaker A: But like it's just like, do you want to start from scratch or do you want to start?
Speaker D: No.
Speaker A: Yeah, from a leg up. But it's all from the actual docs and things. There's nothing that's. There's nothing. There's nothing special that we're doing yet or. And what.
Speaker C: We're.
Speaker A: What I'm taking.
Speaker B: Okay.
Speaker A: Does this make sense though?
Speaker B: Yeah, that makes sense to me.
Speaker A: So what else? So like what are the other elements? Text, scene, audio, subtitles.
Speaker B: It doesn't matter as long as you can find. That would be fine. If you can.
Speaker A: Let's do one more. Let's. So it's five. Color.
Speaker B: Yeah, sure.
Speaker A: Yeah, I like color.
Speaker B: Oh, why I sound so mean sometimes. Never mind. Because I. Sometimes I think like English is my second language.
Speaker A: No, no, col. Color is fine.
Speaker B: I think it's really important for the three of us to know each role. I think like you will be in charge of the fine tuning the model or something. Right, like that. Right. Because you already talk so many.
Speaker A: Yeah, sure.
Speaker B: And I think I know how to make the like front end really stunning when like showing on the screen or something like that. Because you have to cast your eye within first like seconds and then you, you can patient talk and he understands this product a lot and answering all their questions. But I think after we finish the product tomorrow, we might need to rehearse and just be crazy.
Speaker A: Ideally we finish tomorrow.
Speaker B: We will finish.
Speaker C: We will.
Speaker B: We have to finish tomorrow.
Speaker A: Yeah, it's not that much work.
Speaker B: You will be really tired if you really work until 2 or something.
Speaker A: No, no, I don't do that. I mean I sleep at 12.
Speaker B: Yeah, because you gotta go. Are you gonna go home tomorrow today?
Speaker A: I'm going home tomorrow.
Speaker B: I don't have tomorrow. You're gonna stay. Okay.
Speaker D: I. I can work until like 5.
Speaker A: I don't do that.
Speaker B: Yeah, don't do that.
Speaker D: Yeah, yeah.
Speaker A: Sleep is very much.
Speaker B: Yeah, we're gonna finish everything and we rehearsal and then the next day we just come there earlier to pitch to the. To like the.
Speaker D: Is it. So, so how does this work?
Speaker C: Right?
Speaker D: What's the workflow? Do we go and pitch to them and is it filmed and. Or is there a room there? And then we pitch in front.
Speaker B: There's some people. So then normally how the structure goes. So when you get in and you. There will be a talk and the talk is like useless for me, but for you. You can stay over there because like
Speaker A: you told if it's just like a kickoff talk.
Speaker B: Yeah, kickoff talk. Which is like boring to me. But like it's really important when you hear something from them and I want to hear it. Yeah, yeah, yeah. We can both go over there because I want to be low key. And then like we started doing something when we at least have like the front end or something. We just brought our device to talk to those judges and like, oh, do you want to use this? Like, let me show your like brainwave. Could you like show them their real like brainwave in real time?
Speaker D: Yes, we should be able to. Yeah, you just have to make sure that everything gets hammered out and that's what you and I are talking straight about.
Speaker A: Yeah, okay.
Speaker B: Cuz like if me and Devin are going to work on a demo and if you have more time, you just go around and just try to like get there like.
Speaker D: Yeah, so let's do that.
Speaker B: Yeah.
Speaker D: So okay, now I'm playing a.
Speaker A: Yeah, okay, so video after that. So where we get these videos? Should we. So okay, Tech ugc. Should we do for like specific products or just all around? Should we do from the same creator? Should we do like. Because there's a lot of like factors like that. So like for example, like do we just go to this person's page and get like 10, 10 videos from her, 10 videos from someone else? Or we should do like 1, 1, 1, 1, 1. But all for the same kind of product or like something like that. Because it like, because it's like, let's just stick to 50 videos. Cuz like simple. We don't be scrolling so much. But like it should, it should all be kind of like one category. That's what you talk about, one category. Just so like you can be like, okay, because like we can. We need to. We're just gonna get like in the scope and just like to download a bunch of.
Speaker B: Yeah.
Speaker A: And then it's just. We could do that, we could do that. But we should like pick like bro,
Speaker B: is there Any way, if I can show them on the front end, like swiping the video, like we pre download, like the, let's say 15 videos.
Speaker A: No, we'll do that.
Speaker B: We'll do that. And we integrate to the front end here.
Speaker A: This is what I'm thinking for the. For the demo. Okay, so we have this demo. This is like the screen, right?
Speaker B: Yeah.
Speaker D: Oh, are you guys drawing the thing? Okay, I was. Here's what I was thinking too. Very rapper. What are you building or what are you creating?
Speaker B: Right.
Speaker D: This is obviously, like changes. Then this shows into virality elements. We create like a storyline, as in, like a. As a video element. Storyline. Like, what is the call to action here that is going to work for this video? What is the hook and maintenance? And then we show videos like this. Vids like this, this. Okay, so that's one element. Then on the top, we overlay neural spikes, show and then highlight that.
Speaker A: This.
Speaker D: We can annotate those neural spikes saying, this shows high interest. Interest, then here, whatever. And we can say due to that, this works the most. I mean, do we want to integrate more of the brain or keep that? Or is that simplified enough for judges to follow?
Speaker B: I think you should show the video
Speaker A: on the front end, I think like this.
Speaker D: Okay.
Speaker B: Okay. Yeah. Because the video and the nervous spike in the same time.
Speaker A: Video, huh? Big waveform at the bottom. There's two waveforms at the bottom. And then like, whatever product we come with.
Speaker B: What do you mean? Like here, what product?
Speaker A: So, like, we could be like. We can make some, like, basic interface and be like some kind of like chatbot interface, I was thinking plus, like, scoring.
Speaker D: Yeah, but that's like after the screen, right? So, like, I think the first landing page should be what they build.
Speaker A: How long is it done?
Speaker B: I think two minutes or something.
Speaker D: So we can literally have them go, hey, what are we building? Type in the thing goes. Goes to that.
Speaker A: No typing, no typing.
Speaker D: No type.
Speaker A: Everything is wrapper. No typing. I think just like this is the
Speaker B: wave is pretty strong.
Speaker A: The wait, we need to show like, wave first. Wave. Wave should be there. Video should be there.
Speaker B: Yeah, yeah. Video and wave is the most important thing.
Speaker A: Yeah, because like, the typing thing is like, we're just wasting time. Everyone's gonna be. There's gonna be a lot of typing going on. I think like. Yeah, this gets past the typing stuff.
Speaker D: Okay, so then what do we show for this? Right? We can show video, we can show waveforms. Cool. How do we show a virality, like, lottery?
Speaker B: And what about explanation language here? Because, like, you when you see the brain wave, nobody understand that. If you want to show like the agentic workflow is something like fancy. What about like expanding those waves like high interest and give you the signal? Yeah.
Speaker D: And then should we keep this static or should we keep this moving in real time?
Speaker B: What is static?
Speaker D: Moving real time.
Speaker A: Moving real time.
Speaker D: So if we get in real time, that's great. But if we do static, it'd be like an analysis after the video. So let's say you have a video, like from here to zero.
Speaker A: Real time would be really one and
Speaker D: then you show different things.
Speaker B: Real time will be really. Even if we cannot do that, we just use like pre recorded.
Speaker D: This is pre recorded.
Speaker B: Okay.
Speaker C: Model.
Speaker B: So if we could do repair. What do you think?
Speaker A: Not too bad.
Speaker D: I'm street. Can we show like a sort of a mirror of EEG waves changing in real time?
Speaker A: Yes, that's the whole thing.
Speaker C: Can we use a synthetic data set?
Speaker D: Synthetic data set. Okay, make it. We can have Claude, but we are giving the impression that we're going to do it in real time. That's fine.
Speaker A: The real time will be fine because it's just a scale adjustment. We have to like display it. It's not like because there's real data streaming.
Speaker C: Don't like. Yeah, just have a synthetic thing. No one's gonna know. And then don't like tell them to like blink your eyes or anything.
Speaker D: Yeah, he's gonna be wrong. One of us. I'm not gonna.
Speaker B: No, he's not gonna. He's gonna talk. I can wear that.
Speaker D: One of us can wear it.
Speaker C: Okay.
Speaker B: Yeah, one of us could wear. Yeah,
Speaker C: should be fine.
Speaker A: Model. Yeah, have a bunch of videos. They have some characteristics in there inherently. Color, text, audio, whatever. You have all these videos. You scroll, scroll, scroll. And then we bring the data of the waveform. They have some spike. They have some spike. Whatever, whatever. And then your input, it's like replicating meta tri model. You have some video and your output should be the waveform. And then like you have some like LLM decode. Like, oh, this waveform had XYZ spike and I had these characteristics.
Speaker C: Are you changing multiple things per video?
Speaker A: Like so that. That's the thing. You just make sample size a lot really big. So you can like negate these effects. We're just going to do 50 videos and like one specific niche. What, 50 videos each? No, 50 videos. 50. 50.
Speaker C: 50.
Speaker A: 50 videos total.
Speaker B: We the same. 50.
Speaker C: Let's.
Speaker A: I'm just saying 50. Let's see like, I'm trying to do like 20 minutes of content.
Speaker C: 50.
Speaker B: Okay.
Speaker A: This is like 20 minutes.
Speaker C: How many.
Speaker D: Whatever.
Speaker A: 20 minutes of scrolling.
Speaker C: Okay.
Speaker D: There's a, a data set that I have to request.
Speaker B: Okay.
Speaker D: Should be fine. Okay, I'm going to request right now
Speaker C: and then it's just going to be straight on, you guys.
Speaker A: Yeah, that's fine. It's the step. It's just demo.
Speaker B: Yeah, it will be fine, dude. Nobody will be able to go.
Speaker A: It's just. Yeah, it's not, it's not, it's not full fledged product. It's just demo.
Speaker B: Yeah.
Speaker A: If we want to make a full page project, we just do it on more people.
Speaker C: Yeah, but like just do it on like an open data set.
Speaker A: No, because like we need to show the use cases. There's probably a data set on like P3 Spike and like that. We're not gonna, we can have that.
Speaker D: We're most likely gonna do frontalization waves but we're going to do, we're going to look at frontal alpha asymmetry, not P300 photo alpha asymmetry. And then we're going to look at ratios of band powers. It's easier to tell and we have
Speaker A: some neuroscience and there's a wave and then we do some wave correlation.
Speaker C: Then you have to change. Oh, I mean you're doing it for smartest things. Make sure your filters.
Speaker D: Yes.
Speaker C: I'm not, I'm not sure if alpha is going to. Alpha is going to work. Frontal alpha even then. And it's a shitty EEG system and it's low level frequencies.
Speaker A: Is there a brain wave that you want?
Speaker D: We're just saying look at higher frequency. Yeah, we can look at beta alpha.
Speaker C: I'm. I'm saying like do the theta plus alpha over. Yeah, yeah.
Speaker D: No, so we're doing that.
Speaker C: Do that.
Speaker D: Yeah, yeah.
Speaker C: No theta plus alpha on top.
Speaker D: This is, this is written down.
Speaker C: Do that. And then you have stronger data for theta and beta and then alpha is like whatever the. It happens. Yeah. So then initially essentially just boils down to theta over beta.
Speaker D: Why is Alpha worse than theta? Why is Alpha worse than theta?
Speaker C: Because it's a lower frequency, is it not? It's like what's, what's the alpha frequencies?
Speaker D: Alpha is 8 to 13.
Speaker C: I tried right on the.
Speaker D: The only problem. So the problem is, is that you're. You may be right because frontal alpha is not going to be highly present in lucid conditions. It's more so going to posteriorize to the back of the head. Yeah. So that might be a little hard to pick up.
Speaker C: So like. Yeah, so the thing is like it's in the back and then you need like if you're using the head cap then. Yeah, that would make sense. Yeah.
Speaker D: Because you need space electrodes behind the back of the head.
Speaker C: Yeah.
Speaker D: If you.
Speaker C: You're just doing the one we have. Just do the theta and beta ratio.
Speaker D: Yeah.
Speaker C: Theta and beta.
Speaker D: And we'll take the alpha now we have it.
Speaker C: Sure. Alpha. But like I wouldn't waste your time worrying about alpha. Just do theta and theta. Like what we're doing right now. Right. Just do that.
Speaker B: Why? Explain it to me. I don't.
Speaker C: Okay.
Speaker B: Okay.
Speaker D: So basically. So alpha waves in the front of your brain are associated with this Asymmetry is associated with.
Speaker B: Just tell me which one's bigger, which one's that stronger like for showing on
Speaker D: the system Multi data and beta. Because those two brand powers will be more present in the front of the brain toward interest with reg.
Speaker B: Okay, that's good. Yeah, yeah.
Speaker D: So that, that's all because I care
Speaker B: about like when they see the demo, they only see what is like more. If normal people can tell there is a wave, you can tell.
Speaker D: Yeah, yeah.
Speaker B: If it's like only smaller, it's kind of hard to. Yeah.
Speaker C: So I guess you can make the platform to like auto scale.
Speaker B: That's not an issue. Okay.
Speaker C: It's just like. It's just the e. The electrodes capturing.
Speaker D: Yeah. So because the electrodes on the front of the forehead, whereas alpha is highly active in the back of the head.
Speaker B: Okay.
Speaker D: The asymmetry that happens here is not going to be as perceptible as theta and beta.
Speaker C: What's the platform going to be?
Speaker D: How are you going to show them all?
Speaker A: Big, big waveform video. Scrolling video characteristics. Metadata. Chat like interface. Done.
Speaker C: What's the chat like?
Speaker A: Streaming chat like interface on this video. This person had XYZ with some time
Speaker D: and then we can download.
Speaker A: It'll look pretty. It looked pretty.
Speaker B: Yeah.
Speaker D: It is a log.
Speaker A: That's what we're doing. And then after that post, post summary you'd say like this, this video had this. This video had this. This video at this.
Speaker C: So is it gonna. You're gonna get. There's a completely new video that it's never seen before.
Speaker A: That's not the point.
Speaker D: It's a demo, dude. Okay. Okay, cool.
Speaker B: Could you. Could I see that?
Speaker A: Yeah.
Speaker B: So you were saying after they interface it will be here. Right. There's a coffee action button.
Speaker A: And then we can put this square inside here. And then after that we can be like. Okay, end summary. Cuz most of the data analysis is like post, like after everything's done, we can be like, okay. Based on xyz, we found that these videos have better retention spikes because they might have these characteristics.
Speaker B: Let me ask you.
Speaker A: Yes.
Speaker B: Is this gonna be mock data or like where it's like running real time, like analyzing the, like the brand, analyzing the screen real time.
Speaker A: This video. Video characteristics is. We're gonna pre compute all this?
Speaker B: Yes.
Speaker A: Metadata is pre computed. And then the chat log, we could have this separated. Like it could be here, but that's going to be real time, long running. So it'll exist continuously.
Speaker B: I think just get an API and then ask like about the screen. Right.
Speaker A: Okay, let me think. So I was thinking like, you know, sometimes when you're talking to Claude and stuff like that they have like artifacts, right?
Speaker B: Yeah.
Speaker C: So.
Speaker A: Or I think Ted does this best where you have some like image and it becomes like, so this is your whole chat interface. It's like a long thing. You have your bubble at the bottom, boom, boom. You have some at the top, boom, boom, boom, boom, boom. And then when you send an image, it goes like image and then there's like a big text and blah, blah, blah, blah, blah. And then so this is video one, right. And then after that, video two, blah, blah, blah, blah, blah. And this is all like real time or like near real time. So if you're operating this protocol, you can see that like this person at this effect, this person at this effect. Or like, and how this would work, this message, whatever this message is, it'd be like the prompt would be some sort along the lines of like, okay, here basically, video characteristics plus metadata plus the waveform.
Speaker B: So the metadata is for the video, right?
Speaker A: Yeah, the metadata is like, when was the video recorded? How many likes or shares did it get? Or like, or more.
Speaker B: So like, I think you should be fine with this because I'm thinking like, I can do the front end.
Speaker A: Yeah.
Speaker B: Even if something like after I finish that you think something could be added, then you can tell me when we go over there now, I think like, you should be fine. Don't, don't like, don't think like.
Speaker A: I think it's good.
Speaker B: Not like everything. I think you have really good, like intelligence. But like, we don't have to go too deep right now. Maybe we can see that when we improve, keep improving. Could we talk about like, because you're probably going to work for the back end and like the model training. We're using like the model and you're just fine tuning that. We probably need to know how to like connect the front end and like the back end. Right?
Speaker A: That's easy.
Speaker B: That's easy. Okay, so. So we work separately because I like, keep things structured. So when, whenever I push something and you put something, we don't interfere each other, but I can like, do the structure I like.
Speaker A: Yeah. So this would be these. This is all one API call. How do you like, work and like, how do you. How do you want us to interface? Do you just want to do a bunch of API calls? So this, this will be, this will need to like, do together. Just because it's like, it's a little.
Speaker C: This is.
Speaker B: Well from you, right? The brainwave will be.
Speaker A: The brainwave will be. It will be streaming from the device itself. This would be local on the device. It would just be like a python server.
Speaker B: Okay.
Speaker A: So this is like a python server that will work together with. But for the video and the product. Cloudflare API. Just like an API.
Speaker B: Ah, yeah, Easy.
Speaker A: The chat interface. Another API.
Speaker B: Yeah, I'll figure that out.
Speaker A: That'd be another API.
Speaker B: Just like this part thing. We should like work together, right?
Speaker A: Yeah. This like the schema on it. Yeah. The schema for this will be video characteristics. Is the.
Speaker B: This is such a nice thing.
Speaker A: I got it like last week. It's really nice. I like it so much better than like. I mean, I used to write all my notes on paper.
Speaker C: Yeah.
Speaker A: And then I would never read my notes. But now I'm starting to like, change it. So like the video schema would be like these five for the top part. For this part we go here. And then for the metadata, it would just be like, you can, you can just pull it from like the video information.
Speaker B: Could you like, name the 5 schema again so I can like, know what you show on the screen?
Speaker A: Yeah. So first of all, so video. Or let's make. So this is gonna be like I'm design up to you. But the schema, how it would look like? It'd be like audio info, generally subtitles, text, slash, transcript summary. Transcript summary would be good. Summary we can do as a pre, pre, pre analysis step. Color. What is the color profile? That would just be like. Oh, do you. Have you seen. That would be so sick. We can do that. I know exact color. Like this
Speaker B: for what the color.
Speaker A: Like this is the color of the video.
Speaker B: Oh, oh, oh, oh. What does that mean?
Speaker A: So like, like every scene they took like the average.
Speaker B: Ah, okay.
Speaker A: So they found like.
Speaker B: Are we going to show this on front end?
Speaker A: That would be sick.
Speaker B: Yeah, that would Be really sick because.
Speaker A: So it'll look like. It'll just be like a big bar. And you can be like.
Speaker B: But there's too many information on, like, a small. Like, because the screen is not that large. Let's say the. This part is the video. And we only have, like, this part. And you're gonna show them over there.
Speaker A: So we'll. We'll show the color. I mean, some of this we don't. We can, like. This is like a. This is like a true false value. This is like tf. This is like one word. This is maybe like three lines. Yeah. This is like a bar.
Speaker B: Mm.
Speaker A: And then I had one more.
Speaker C: Oh.
Speaker A: Seeing how many cuts. That's a number. This is a number. Okay. It's only five things. And then what also would be useful is, like, length. That's, like, on the metadata side. So this is video metadata length. What else do you get? Creation date. That's, like, all small. Like, this is all, like, small. I would make it, like, very, like, like twice as small and fun only
Speaker B: for the cool stuff and, like.
Speaker A: Creator. Creator name.
Speaker B: What the white. Does creator name matter?
Speaker A: Because, like, say, for example, I'm the marketing firm, and I have, like, 10 creators.
Speaker B: Okay.
Speaker A: I want to kind of compare. I want to know who made what.
Speaker B: You should be really good for demoing. When you talk about that, you should be talking.
Speaker A: You can all talk about it.
Speaker B: Go briefly. Because we don't have much time for it. Like, if we.
Speaker A: Yeah, I mean, like, we don't need
Speaker D: to talk about all this stuff.
Speaker A: I think this would be important to talk about. And that. Yeah. So that's for video data and then along. So this is going to be shipped.
Speaker B: Yeah.
Speaker A: Plus video.
Speaker B: Yeah.
Speaker A: As like an MP4 file. Right. So this is like one API, right? This is all one API.
Speaker B: Did you already download all those videos?
Speaker A: We need to find it. Okay, you got it. API.
Speaker B: When you find it, how could you send to both of us just, like,
Speaker A: Just the share links.
Speaker D: Yeah. Or I can download them. We can all have, like, a show.
Speaker B: Okay.
Speaker A: The share links. And then, like, I'll upload it to a Cloudflare, and then we can just, like, it's supposed to pull it from the API.
Speaker B: Okay, Gotcha.
Speaker A: Yeah. Boom. So that's one API. Second API would be the chat interface. You can kind of do that. Or, like. And that API would be like. It would be like, GPT real time.
Speaker B: Yeah. Because they're sponsoring us.
Speaker A: Yeah, GPT real time. And it. The inputs. The prompt or. Yeah, prompt or the. Yeah, prompt would be Basically all of this, all this metadata.
Speaker B: So like if there's a prompt, our work is still gonna type on stage.
Speaker A: No, it's like a indo, like system prompt.
Speaker B: Oh, okay, okay. Yeah, so it's like. Oh, I see.
Speaker A: I think, yeah, system prompt. So like prompt would be like
Speaker C: all
Speaker A: this like above data plus like I don't know. You are a data. Video analysis.
Speaker C: Whatever.
Speaker A: We can come up with some.
Speaker B: Ah, I see your point.
Speaker A: Analyze this video and then we'll have some chat box if they want to chat and they can. Like the main thing is that we need like a reply. Like reply to specific message. Because every time someone scrolls it's gonna be like it, I don't know, later. Yeah, once this is more important and then after that.
Speaker B: But when we demo, we're only gonna show one or two video, I think how many?
Speaker A: You said two minutes, right?
Speaker B: Two minutes for recording. But on the stage maybe three minutes. But you guys gonna talk about other stuff too. So I think like we should limit how many are videos we screw on stage.
Speaker A: We don't really need like the chat thing was like we can just tack it on. But we don't really need it. I think just like video characteristics. Waveform.
Speaker B: Yeah.
Speaker A: And we show like three videos or four videos and be like say for example, Yuva's been scrolling for 20 minutes and these are the last three. This is what he's been doing. And this is the interface that the operator sees. And then after that we have like this like post. We have another screen and that screen would be like post, post, post session analysis. And this is all like fake data now. And we can say like, oh, videos we. These videos one, one they have because they have the best. Because. It's just like summary statistics. These videos won because they have the best conversion. This
Speaker B: here I think you should talk about how the brand wave function during this was like the reason why this video won is because of the way like we capture. Blah, blah, blah.
Speaker A: Yep. This creator makes the most engaging content. So like that's a big asset. This creator has the most engaging content. I think a big thing is like also like what a lot of UGC people is that they hire like all these creators, but finding like the one that's actually good and then doubling down on them is like a big asset. And then the second thing would be like format. So like creator format. And then like these videos 1.
Speaker B: Okay, here's one question for you. Like let's say when you were. When we were demoing, we're probably gonna wear the device and Then show these three screen. Right. And when you answer something like this video one. But this is only one for this person. How can you give advice for other.
Speaker A: Well, so I think in the demo we need to say like, okay, this is like a study we would be doing on our key demographic and say like after. Say we have to. I think in the demo we've seen to say like after we did this for like 100 people and we compensated them for their time or something along this.
Speaker B: I think it should be separate. So the third screen should be separated.
Speaker A: This is like entirely separate.
Speaker B: Yeah, the third one should be separate,
Speaker A: I think just two screens.
Speaker B: This, this one and two screen and then three. Yeah. Oh, I see. Okay.
Speaker A: What were you thinking for the third?
Speaker B: Oh, because what I'm talking about, the third is like the. The report, like the thing you just talked about, like these three videos, one in which demographic. But that would be separate because at that time we're not using the hardware for one person. It's like we already collect, let's say, hundreds of people's data and then we show them. But during the demo, we could have said we collect our data or like. Or 100 people. Maybe 100 people is better, I think.
Speaker A: What do you think would be better? 100 people?
Speaker B: Oh, I think it would be even crazier because if we show them we using our three of us or like using. Actually Holly likes this the most.
Speaker A: How they.
Speaker D: What?
Speaker B: Because that's not like demographic.
Speaker A: Yeah.
Speaker B: Too small. But what's the point of using our three, like using the three of us data if we. When we say that we didn't mention that at all. If we only say this is like for this type of demographic, like women, 25.
Speaker A: I think. I think we can just say like, between the three of us, we. We found this is the best video.
Speaker B: Oh, okay. Okay.
Speaker A: If that. Yeah. I think that's like a statement we can make if we do the training.
Speaker B: But yeah. So if we. If we don't make this thing and
Speaker A: it's easy to scale up to much more to. To larger demographics.
Speaker C: Yeah.
Speaker B: Okay. Okay. Oh, sure. Sure. We could do that. Because it would be crazy if the demo, when we showed that like the recording demo, like we captured like you and me and like Yuva, we use the hardware during a YC hackathon background.
Speaker A: Yeah.
Speaker B: It's like during these two days, we actually collect 3 of our data.
Speaker A: Yeah.
Speaker B: And we find it. Blah, blah, blah, blah, blah.
Speaker A: These are the best videos.
Speaker B: And then we realize this can much scale.
Speaker A: Yeah.
Speaker B: And we even use on Some of their judges. So we can like tell our. What our judges like.
Speaker D: Yeah.
Speaker A: Okay.
Speaker B: It would be a good, cool narrative.
Speaker A: That would be a cool narrative.
Speaker B: Rather than like you just give them like 100, maybe. 100 is cool, but like not super relatable.
Speaker A: We don't even. I don't think you even need 100. You probably need like, because you want it like, say, for example, like you have like a. I don't know, like a fitness app for a very. For like. Yeah,
Speaker D: I'm getting access to the data set.
Speaker B: Okay,
Speaker D: so you guys are working on front and back end?
Speaker B: Yes, I'm working on front. He's working on back.
Speaker D: Okay, cool. And then what videos do we need? We were looking for videos in the
Speaker B: fall UGC, I think.
Speaker D: UGC category. Okay.
Speaker A: How many do we need?
Speaker B: 50.
Speaker D: 50.
Speaker C: Cool.
Speaker B: And he mentioned should be one category. So this part you probably need to comfort with him before you talk.
Speaker D: Yeah.
Speaker B: So yeah. Or like you can select we. We.
Speaker D: I already did all the analysis for this most dominant broad category. UGC is like commercial tech. So just going through like top demos, talking about the text skits, all in the talking head style. That's easy to do. So then I'll get videos, send it to a drive, and when we go there, we have all the content. Now he's working out setup. I'm getting a data set for you to fine tune model on.
Speaker C: Okay.
Speaker D: Is best for me to then come to. So what is different from like last 10 minutes where I was doing this and reading on this? What did you guys decide it was? Or you guys just talking about design and function?
Speaker B: We're talking about what information to put on like for the demo. And also how we're going to phrase this because the fact we're using. Collecting three of us, our data is because we want to show them like during a demo. If we have like we're in a headset with the YC background and we can talk like. So during these two days, we actually collect our. The three of us, our data. And then we realize the three of us like this type of video. And here's why. And then you said something like. Then we can scale to like much larger demographic. That would be cool.
Speaker D: Okay, cool. So we're starting with three of us. YC Doom scroll.
Speaker B: Yeah.
Speaker D: Cause whatever. So I can make that a little funny schedule.
Speaker B: Yeah, okay, funny.
Speaker D: Then expand out to I. And that is because of XYZ signal.
Speaker A: And then you're like.
Speaker D: Is that what you're thinking?
Speaker B: Because if it's like three of us Are data, then it should be focused on the three of us. Like what type of video? Right? I don't know. Like, you tell me. How do you think?
Speaker D: Okay, so what we're saying is we three liked videos and we all realized, as everyone does, we like watching stuff about tech. Make it a little satirical. Yeah, but tech, right?
Speaker B: Yeah.
Speaker D: Then you're like, curious why that is. We wanted to see like why we enjoy this.
Speaker C: Right?
Speaker D: We understand the standard metrics of talk about what's already out there. Standard metrics, likes, comments, etc. And DMs. But we were really curious to see what the underlying consumer psychology was
Speaker C: and
Speaker D: if we can engineer a way to use our own biodata.
Speaker B: Also talk about during the hackathon, you ask how many judges to use your product. You can even add it. Like I actually asked like five judges to use our product. So in the future we might can like even guess what our judges like or something like that. Like you phrase that. Yeah.
Speaker D: So we'll do. We'll put that in the end.
Speaker B: We'll put that here at Storyteller.
Speaker D: So to use our own data to see why we like this video. And so we did. Here's what it looks like something vibrating.
Speaker B: Yes. Oh, no. I think it will be fine.
Speaker D: So we did. Here's what we build. And then this would be full hero shot. Hero shot of product.
Speaker C: Okay.
Speaker D: Talk about features.
Speaker B: And during this part, do you think one of us should wear the hacker?
Speaker D: Yeah, so one of us should always be wearing it.
Speaker B: Oh yeah.
Speaker D: Like, what the fuck is that? Like, that's a visual hook.
Speaker B: Right.
Speaker D: Okay, so now we talk about we. So once we go through features and walk through which we have to build out, then we talk about. So this is only with three people. So this is only with three people. We also had judges building on with more data, we can predict and explain why the judges like this through their brain.
Speaker B: Yo, do you think if we can convince one of the judges to use their product, at least watch five videos and then just say if they're comfortable with us sharing their name and we realize, blah, blah, blah, they say, John, like this the most. If we can convince them to be comfortable to use their name during the
Speaker D: demo and then show limited data. Yeah, limited data. Then show more data unlocks more accuracy. Yeah, more accuracy. Okay, so now it's her story, right?
Speaker B: Yeah.
Speaker D: Three of us, we were bored and we were just figuring out what to do in YC, right. So naturally we opened up TikTok and Instagram Reels and just decided to scroll Through.
Speaker B: Yeah.
Speaker D: And we came to this conclusion that we like watching talking head video brain rods. And it just so happens we are at the YC growth hackathon, so why not marry the two and see why we like it, right? So we decided to bring a little tool and we wanted to see if we can engineer this, engineer a product or engineer a framework that utilizes our own brain data to explain why we like certain videos. So we wore the device for the entire hackathon and we watch a lot of videos. Trust me, it's a lot easier than you think it is because who doesn't like watching videos? And this is what we were able to come out with. So we show all the features, walk through them, and again, the way I'm seeing up this very rough, I'll turn up the verbiage and everything, but this is just a walkthrough, blah, blah, blah. And then so we're also curious, what if in order to win, wait, what if we also got what the judges liked? So we had Aaron come with a device and see what his brain liked. And here's what this showed. So on a limited Data set, only 10 videos, 5 minutes whim, we were able to see that these waves are corresponding with interest spikes for Aaron Spring. Aaron loves Tech ugc, as I'm sure the rest of San Francisco does. But what does this unlock? This unlocks with more robust data sets, the ability to unlock your own personal virality through utilizing your own neural data. And more than your own neural data, utilizing everyone's neural data. And that's how you go viral without throwing a dart on the blind wall. You have a data driven way to get there.
Speaker B: When you say like Aaron likes Tech ugc, I think that there's a sign of all this is perfect. But just be more specific because Aaron's definitely different from other judges. Right, Aaron specifically, what type of like UGC content? Like it's like tech, but what I on talking speed and like what's the video is kind of like. And be a little bit more specific because we're going to go through like during the screen it will show like five schema of. Because he was talking about like the audio and like the color, etc. So you could be more specific to show.
Speaker D: So we can show Aaron. Aaron is a big judge. We can show Aaron series a couple videos. We can show alterations of those videos that are very similar in content and style but with different elements, like visual elements, talking speed, text, subtitles.
Speaker B: Yeah.
Speaker D: And we see how the brain responds to all these things.
Speaker B: Yeah. So Aaron, what Aaron's like, it's definitely different from other judges. So if you bring up the difference will be make the product more trustworthy.
Speaker D: The other thing you can do to make this more funny or funnier is we can do a comparison like a fight off between Aaron and Sarah, who's another judge.
Speaker B: Okay. If we have time.
Speaker D: Yeah, if we have time. If we have time for them to wear it.
Speaker A: Oh, I got it, I got it.
Speaker C: The email.
Speaker B: Yay.
Speaker A: Oh, yes.
Speaker B: Did you guys confirm that?
Speaker A: Confirmed.
Speaker B: Oh, yeah.
Speaker D: How did I get through a flow state account?
Speaker A: We put her first to you.
Speaker B: No, I put his thing.
Speaker D: Oh, it's probably from our YC app. Just like I done your. Your.
Speaker A: We'll do the model training tomorrow because we need device for today. Yeah, but it's fine because today we'll build us get the videos and then we'll build everything out and then tomorrow all we have to do is train the model.
Speaker B: Okay.
Speaker A: And then front end.
Speaker B: Yeah, I'll do that. And the things like, because I like keeping the thing organized so I don't get confused, I'll like do exactly the structure. Could you please follow the structure? So you do in your photo are doing my footer. And then like we can like merge.
Speaker A: Yeah.
Speaker D: So here's, here's how the storylines look.
Speaker C: Right.
Speaker B: Also like Yuba, I think you can talk most of the time, but maybe like Devin can take say something about the. The screen when the screen pop up.
Speaker D: So you guys can do the future walkthrough, right? If you don't want to do any
Speaker B: of the walkthrough, I will be the one who wearing the device. I just want to take a break from all this.
Speaker D: So you wear the device. Devin, you're going to talk through features and I'm going to provide a whole hero demo for it.
Speaker B: Right.
Speaker D: So the idea is we got bored during the YC hackathon.
Speaker C: Really? Right.
Speaker A: Like during the demos, we got bored.
Speaker D: No, we got bored during the YC hackathon. Like as soon as we got there, we were bored. So what do we decide to do? We decided to open TikTok and Instagram and scroll on our phone. And then we were curious that, you
Speaker A: know, how much time do we have?
Speaker B: I mean, he'll practice tomorrow.
Speaker D: I'm giving you a story back.
Speaker B: Yeah, okay.
Speaker A: This is good.
Speaker D: This is good. And then we found it very funny that all of us liked tech related content. No surprise. Where are we?
Speaker C: Right?
Speaker D: And so we thought what, What's a perfect way to marry the growth theme of this hackathon and our own personal interests slash laziness.
Speaker A: What about instead of saying like, this narrative? I think instead of saying like, we're bored of the YC Hackathon, I think a better hook would be like, we're all B2B SaaS founders and we have no clue about what to do with growth besides numbers. So we made this device something along those.
Speaker D: That's fine, it's fine.
Speaker A: I like the narrative though. We can go either way. Because the only thing is that this
Speaker D: differentiates and appeals to their either ethos.
Speaker B: Yes.
Speaker D: Because it's like, oh, everyone likes to go on their phone. And we got a unique insight into like, hey, we're fucking bored.
Speaker B: Yeah.
Speaker D: And we have shot attention spans. So we're like, okay, we like these certain type of videos and we are at the YC hackathon. So we thought, what if we build a tool that actually shows us what our consumer psychology looks like through our own brain? So with the help of a little tool we like to call an eeg, we were able to see.
Speaker A: I wouldn't say like, help a little tool. I'll be like, bro, I'm not saying the fucking script I'm giving you, finalize it right now.
Speaker D: No, no, no, no, no, no. Fine tune, like exactly how we're presenting this.
Speaker A: Yeah, okay.
Speaker D: But this is the general, like, storyline, right? So we're going to show them the little trick, the E. G. And then we're going to say, so here's what we built using our own neural data watching videos feature walkthrough, Right, Walkthrough. And then after that we say, but we were curious, right? Like, what do the judges like? So we asked Aaron and Aaron put on her device, watched a couple videos and like, and here's what happened. We show the video and we show like different iterations of videos. What hooks you responded to? So that's neutral.
Speaker A: And we can see like, Aaron really likes XYZ content.
Speaker D: Aaron really likes anime girl content. So then we were even more curious, what does Sarah like and how does that differ from Aaron?
Speaker A: Now we do the same thing.
Speaker D: First Sarah and now we put up the audience, right? So we say, so who do you think has better video taste? Aaron or Sarah? Or we can say some. Something on the up. So something to elicit some funny competition between the two. So I can say, as we can see, Sarah and Aaron are quite different. Right? And then we say that. But this is only on a limited data set. So what happens when we expand this? We build, we are able to build a framework that with more data, including our own, but also the population that better understands how we personally respond to virality in real time. That helps us nail down what makes a certain type of genre, sub genre and style of video go viral. Highly specialized, that genre.
Speaker C: Right.
Speaker D: So what we build is a hyper specialized direct pathway to growth and virality for social media. Okay, again the free everything this is good needs to work.
Speaker A: This is really good.
Speaker D: Storyline, elements.
Speaker A: Storyline is good. One thing is that okay, so in ugc like generally the ad space is that okay. How this kind of works is that say I'm Clulie, I hire 10 creators, they all make one post a day for a month and then at the end of the month I see which posted really good. And then I put, I use ads and promote that specific post. Yeah, I promote my top performers because they obviously hit the, you know, whatever the algorithm likes. And then if you put ads on the most performing post, it'll do better than if you put ads on the worst performing post. So what most people do in this kind of like sector of the industry is that they do this kind of trial of error, trial and error in public or like in production. I think that's the best way to say it. They do this trial and error in production where they're like, oh, here creators make a bunch of posts at the end of the month, I'll review them and then we say, okay, this is your best, this is the best post. I'm going to put $100 a day on this post promoting it across all platforms and it will do some numbers. What we're trying to do is that rather than you going full fledged in production and like taking a month and taking all this time to even get to the step where you figure out what are your best performers, we want to lower that lead time by figuring out on a scientific basis which ones will do good before they actually do good. Okay, and how, and then how we can do that? It's like we download, we download a bunch of like a wide range of TikToks and like social short form content online. We hid the likes shares and all the social performance metrics on them, show them to a bunch of consumers, I. E. Three of us. And then we found out specifically between the three, which ones did the best and which ones didn't. And then we found that even the ones that did the best correlated with the ones that did really good. And because they had like XYZ aspects, that was a bad. That's a matter of phrasing it. But do you get. What do you want to say?
Speaker D: Yeah, I do.
Speaker A: I mean, because like most, most times marketers, they just do. They just put a bu. They put a bunch of out in production and they're just like, yeah, yeah.
Speaker D: That's the whole thing.
Speaker A: They spend so much time that we
Speaker D: are reducing the need to just blindly release videos to see what hits the algorithm and goes viral based on other videos. We are doing a way that's using our own consumer psychology to directly hit the nail on the head. I think to reduce the amount of videos necessary.
Speaker A: I think, I think the narrative should be like, we're reducing the amount of throwing. We're reducing the amount of darts.
Speaker C: Darts thrown.
Speaker A: That, that. Darts thrown. Reduce it. Yeah, we're reducing the amount of darts thrown so you hit virality sooner.
Speaker D: And then what does that give? Now we give financials, right? So we can give an estimate of recent estimate of videos, vids per week of a firm.
Speaker A: No, we don't need to say that. That's like after. That's not demo. We don't even say that.
Speaker C: Okay.
Speaker D: If we don't.
Speaker A: I, I think, I think this, this point needs to be nailed down too. Because like anyone who's in UGC and like all these judges, what they do is like, they get like a hundred creators, they give them like a hundred dollars per video, a flat fee, plus like retention bonus and everything like that, just to make a bunch of content. And then they're just like spraying money.
Speaker D: So reduces cac, improves ltv.
Speaker C: No, no, no.
Speaker D: Ltv.
Speaker A: Cac. It doesn't reduce cac.
Speaker D: It does because it reduces the amount of videos you need to make.
Speaker A: LTV is like a downstream metric. Cac. I would also say it's a little bit down. It would. Reduces cac, we can say, but it reduces your UGC spend. It reduces your ugc, your marketing. Oh, there's like a term. Reduces your. We're increasing your c. We're not. This is like all downstream, though. Like, it's downstream. But you see capping. Cpm. CPM is cost per mil. That's a common term that people use, cost per million. It means like cost per mil.
Speaker D: So reduces costs, reduces cdm, which reduces cap, which improves your LTV over cap.
Speaker A: We don't need to say the LV over time. We can just, we can just stop at K and we can.
Speaker D: And what does this mean?
Speaker A: CAC is a.
Speaker D: No, no, I know, bro, I know. What I'm asking. What does it mean? As in why, like for the story.
Speaker A: We save your bottom dollar.
Speaker D: Sorry, Bottom, bottom line, we save your money. We save your money.
Speaker A: You can stop spraying and praying and
Speaker D: stop spraying and praying.
Speaker A: How's it going?
Speaker C: Yes.
Speaker A: Yeah. You're here and not at the marine
Speaker D: orientation, already working in your team. Is that the rationale?
Speaker C: Yes.
Speaker D: Also I've been to the. We've been to Frontier so many times. Stop. Yeah, so stop.
Speaker A: Stop spraying and start.
Speaker B: That's a good hook.
Speaker A: Start using science too.
Speaker D: Yeah, using science to be less chopped.
Speaker C: Yeah.
Speaker A: I wouldn't say less shot, but no,
Speaker B: the YC people are really like, that's
Speaker A: not the right way to say chopped. Yeah, less chopped.
Speaker B: It's okay.
Speaker D: Using science to get less chopped and getting. Using science to get. To stop yourself from getting clowned on by your friends for not going viral.
Speaker B: It will be a little bit.
Speaker A: Chopped is good. But that's the way you send that sentence like, we need to fix this.
Speaker D: Okay, top is good.
Speaker A: We'll use top, I. E. Friends making fun of you.
Speaker D: Because that's a big fear for everyone.
Speaker C: Right?
Speaker D: Like their friends are gonna see usually who the is this guy.
Speaker A: Okay.
Speaker B: Yeah, yeah, I like this.
Speaker A: But do you like that narrative though, with the pack? I think that's a better narrative. I think.
Speaker D: Okay, we can tie this in, right?
Speaker A: So we can do the demo.
Speaker D: Do the demo and say, what is this? We'll do the.
Speaker A: Because we're pitching to the judges. All the judges know what CPM and CAC is and that those they can live and die with this message.
Speaker D: So we do all of this and say, so what does this all mean in the grand scheme of things?
Speaker A: Yeah.
Speaker D: By hyper specializing videos to your own psychology. We are reducing cpm, which is we're going to reduce customer acquisition cost. The bottom line is that we are going to reduce the amount of. We are going to make it so that you stop.
Speaker A: We are going to make it so
Speaker D: you stop spraying and praying with videos and making you less chopped by making your buyer faster. I mean, again, wording and everything has to be fleshed out, but I think
Speaker A: that that does fall strong narrative.
Speaker D: Yeah. So we have a very good intro hook. People are gonna be peaked on what this device is. We're gonna be going in casual nunchalot. Then we have, you know, full work through the product, which is like whatever. Then we do judge interaction, which is probably something that not a lot of people are gonna do there. Then we show what this all means and we use some funny terminology. That's why C like signal.
Speaker B: Yeah. Also like right now the narrative is really good to. Tomorrow. I think we gotta Practice. Narrow it down to like two to three minutes and then he will engage.
Speaker D: Yes.
Speaker B: He needs to talk to the screen. After we have this, I'll do a
Speaker A: demo and you can like do the bottom line.
Speaker B: Yeah, and I'll be like the COVID Yeah.
Speaker D: So you, you do all the, the mechanical work doing this, you do the walkthrough of the products for the judges and for what we did. And then I'll give the narrative and
Speaker A: you do the judges. I think you do the judges and then.
Speaker B: Yeah, you do the judges.
Speaker A: Row. But wait. Four things that needs to be done today. I need to do this. You pick the videos.
Speaker D: Yes.
Speaker A: 50. 50 plus.
Speaker D: 50 plus.
Speaker A: More than 50 would be ideal.
Speaker D: Yeah, just like scroll and then now Holly, with your assessment, how feasible is this too? So the only problem is that you get some data sets. The it's locked behind some people getting back to me with access to the data sets. So I got an email, whatever.
Speaker B: So could we use the data set
Speaker D: but I have to email. I'm going to push them to send it today.
Speaker A: In worst case we can. It's not a crazy model.
Speaker B: Yeah, yeah, it's like three people. I mean.
Speaker D: Yeah, okay, cool. Sounds good.
Speaker B: All right, I'll make the structure. Also like tomorrow you guys need to like work together and I mean we get like demo after we are done.
Speaker A: So tomorrow. So today videos, we'll get the structure down and everything like that. Tomorrow, tomorrow before the hackathon, sometime we'll all do the study ourselves. So we get our data and then from there we can directly make the model. So then ideally before we the hackathon starts, we have the model done.
Speaker B: Yeah, I'm going to go hackathon.
Speaker A: We can see whatever and then we can do a judge.
Speaker B: So tomorrow should I come early for like the. Tomorrow a hot beer or something?
Speaker A: Tomorrow starts at 4.
Speaker B: It's patch. Cuz you told me like we're going to do the model down, make the model down, finish.
Speaker A: Right, we can make the model down.
Speaker B: Because I have to come here for you to collect my data.
Speaker A: I didn't pay for park.
Speaker B: I didn't pay for what? Oh, okay.
Speaker A: I'm so sorry.
Speaker D: There you are. It's fine. There's no. The cops have bigger things to worry about here.
Speaker A: It's been a couple hours now.
Speaker C: Okay.
Speaker A: Okay. But wait, you say I just go pick the park.
Speaker D: All right.
Speaker C: Okay.
Speaker D: How many gears to stand?
Speaker A: But for tomorrow I think come like one or two.
Speaker B: One or two. Or like come to the house. You gotta confirm with him because he will be able. Oh, you can. I mean, too.
Speaker A: I'll scoop up.
Speaker B: Yeah. And I'll structure everything and do, like, a precise prd. Let me know what. What went wrong or, like, what should be fixed because the purity is really important for us to have the alignment.
Speaker A: Yeah, yeah. Boom, boom.
Speaker B: Yeah. I'm going to take a picture for this.
Speaker A: I'll. I'll send you a PDF.
Speaker B: Oh, yeah, sure.
Speaker A: This one's. It's, like, so nice.
Speaker B: Yeah. Oh, where did you. How much is it, if you don't mind me ask.
Speaker A: 500 bucks.
Speaker B: Oh, okay. I can find cheaper in China.
Speaker A: Yeah, sorry. I do have an iPad.
Speaker B: You should.
Speaker C: Okay.
Speaker B: You didn't know me otherwise. I can buy in Chinese. I'm like. Because this is probably made in China, bro.
Speaker A: No, it is like, this justice screen is, like, 100 bucks in China.
Speaker C: Okay.
Speaker A: From, like, you can get it anywhere in China. But, like, the main thing is, like,
Speaker B: I don't want to do it. Hey, I know. I know what you mean.
Speaker A: But the thing also is that it's, like, very responsive, too. I think if you. If I didn't, like. I tried the Kindle version of this
Speaker B: before, and that's so good.
Speaker A: It was really bad.
Speaker B: I want to sell these two. Am I. I guess I can make 400 bucks. Sorry, I'm always about business.
Speaker A: No, that's good. I don't think.
