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

#intermission vidz
# ['9s5ok_skk7s', 'XJ6WIMyLZ7I', 'iACtZ8cP94g', 'RWN8JSBMNp8', 'I24T00bw9rk', 'NZeP8DDWWXc', 'aCxGn18su7Q', 'Hwkt0KNdaCc', 'zNfjcazPbNA', 'G7RgN9ijwE4', 'JbepN4dKLbU', 'WVqGROfiKmA', 'q1LSv468kzI', 'mpSxhFLrIWo', 'HrN-GPYlcbQ', 'KAr_Vcy247Q', 'a_SF2p59aDY', '_QSA5b_q5yU', '95YdE89nTgI', 'sJgDYdA8dio'].each do |intermission_video|
#   video = Video.where(id: intermission_video).first_or_create 
#   video.id = intermission_video
#   video.title = "INTERMISSION"
#   video.save
#   video.download unless File.file?(video.file_path)

# end


