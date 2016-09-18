# use rake db:seed (or created alongside the db with db:setup).

dio   = User.create! name: 'Diogenes of Sinope'
foma = User.create! name: 'Foma Fomitch'

Channel.create! title: 'Tha Corinthians', content: 'If I lack awareness, then why should I care what happens to me when I am dead?', user: dio
Channel.create! title: 'Cynicism ', content: 'I am a citizen of the world (cosmopolites)', user: foma
