var Botkit = require('botkit'),
http = require('http'),
libxmljs = require('libxmljs');

// Expect a SLACK_TOKEN environment variable
var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

var controller = Botkit.slackbot()
var bot = controller.spawn({
  token: slackToken
})

bot.startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack')
  }
})

controller.hears('urban (.+)', ['direct_message', 'direct_mention'], function (bot, message) {
    var word = message.match[1];

    http.get('http://api.urbandictionary.com/v0/define?term=' + encodeURIComponent(word), function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var response = JSON.parse(body),
                entries = response.list;

            if (entries.length) {
                var entry = entries[0];
                console.log('<@' + message.user +'> ' + entry.word + ': ' + entry.definition);
                bot.reply(message, '<@' + message.user +'> ' + entry.word + ': ' + entry.definition);
            } else {
                bot.reply(message, '<@' + message.user +'>, I could not look up that word. Are you sure you typed it correctly?');
            }
        });
    });
})

controller.hears('define (.+)', ['direct_message', 'direct_mention'], function (bot, message) {
  var reference = 'collegiate',
  references =
  word = message.match[1];

  var websterApiKey = process.env.WEBSTER_API_KEY;

  if (!websterApiKey) {
    console.error('WEBSTER_API_KEY is required!');
    process.exit(1);
  }

  http.get('http://www.dictionaryapi.com/api/v1/references/' + encodeURIComponent(reference) + '/xml/' + encodeURIComponent(word) + '?key=' + encodeURIComponent(process.env.WEBSTER_API_KEY), function(res) {

    var body = '';

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {

      try {
        var xmlDoc = libxmljs.parseXml(body),
        entries = xmlDoc.root().childNodes(),
        entry = entries[0],
        typeObj = entry.get('//fl'),
        definitionObj = entry.get('//def/dt'),
        type = typeObj.text(),
        definition = definitionObj.text().replace(':', '');

        bot.reply(message, '<@' + message.user + '> ' + word + ' ('+ type +'): ' + definition);
        console.log(word + '<@' + message.user + '> ' + word + ' ('+ type +'): ' + definition);
      } catch (ex) {
        bot.reply(message, 'Sorry, <@'+ message.user +'>, I could not look up that word. Are you sure you typed it correctly?');
        console.error(ex);
      }

    });
  }).on('error', function(e) {
    console.log('Got error: ' + e.message);
  });
})

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
})


controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello.')
  bot.reply(message, 'It\'s nice to talk to you directly.')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
  '`bot hi` for a simple message.\n' +
  '`bot attachment` to see a Slack attachment message.\n' +
  '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
  '`bot help` to see this again.'
  bot.reply(message, help)
})

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
  var attachments = [{
    fallback: text,
    pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
    title: 'Host, deploy and share your bot in seconds.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://beepboophq.com/',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})
