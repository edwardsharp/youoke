# use rake db:seed (or created alongside the db with db:setup).

dio = User.where(name: 'Diogenes of Sinope').first_or_create do |user|
  user.name = 'Diogenes of Sinope'
end

foma = User.where(name: 'Foma Fomitch').first_or_create do |user|
  user.name = 'Foma Fomitch'
end

Channel.where(title: 'Tha Corinthians').first_or_create do |chan|
  chan.title = 'Tha Corinthians'
  chan.content = 'If I lack awareness, then why should I care what happens to me when I am dead?'
  chan.user = dio
end

Channel.where(title: 'Cynicism').first_or_create do |chan|
  chan.title = 'Cynicism'
  chan.content = 'I am a citizen of the world (cosmopolites)'
  chan.user = foma
end
