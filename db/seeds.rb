# use rake db:seed (or created alongside the db with db:setup).

dio = User.where(name: 'Diogenes of Sinope').first_or_create do |user|
  user.name = 'Diogenes of Sinope'
end

foma = User.where(name: 'Foma Fomitch').first_or_create do |user|
  user.name = 'Foma Fomitch'
end

Channel.where(title: 'karaopy').first_or_create do |chan|
  chan.title = 'karaopy'
  chan.content = 'wifi: lacuna  passwd: karaopy'
  chan.user = dio
end

Channel.where(title: 'cynicism').first_or_create do |chan|
  chan.title = 'cynicism'
  chan.content = 'i am a citizen of the world (cosmopolites)'
  chan.user = foma
end
