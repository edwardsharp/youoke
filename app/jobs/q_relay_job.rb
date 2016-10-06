class QRelayJob < ApplicationJob
  def perform(video)
    
    video.update_column :position, video.q.q_length + 1

    ActionCable.server.broadcast "channels:#{video.q.channel_id}:qs",
      q: QsController.render(partial: 'qs/q', locals: { q: video.q })

    # system('youtube-dl', "-o#{Rails.root.join('public', 'videos')}/%(id)s.%(ext)s", video.id)
    output = `youtube-dl -o"#{Rails.root.join('public', 'videos')}/%(id)s.%(ext)s" "#{video.id}"`
    
    Rails.logger.debug "\n\n[youtube-dl] output: #{output}\n\n"

    if(!output.match(/.*Merging\ formats\ into\ (.+)/).nil?)
      file_path = output.match(/.*Merging\ formats\ into\ (.+)/)[1].gsub(/"/,'').gsub(/\\/,'')
    elsif(!output.match(/.*\[download\] +([^\ ]*)/).nil?)
      file_path = output.match(/.*\[download\] +([^\ ]*)/)[1]
    end

    unless file_path.nil?
      file_path = Dir["#{Rails.root.join('public', 'videos')}/*"].select { |e| e =~ /#{video.id}/ }[0]
    end
    
    video.q.reload

    if !file_path.nil? and File.file?(file_path)
      video.update_column :file_path, file_path
      video.update_column :position, video.q.q_length + 1
    else
      #destroy this video record?
      Rails.logger.debug "\n\n[youtube-dl] ERROR could not figure out a filepath!\n\n"
      video.update_column :position, nil
    end

    if video.q.q_length == 1
      ActionCable.server.broadcast "channels:#{video.q.channel_id}:player",
        player: ChannelsController.render(partial: 'channels/player', locals: { channel: video.q.channel })
    end
    ActionCable.server.broadcast "channels:#{video.q.channel_id}:qs",
      q: QsController.render(partial: 'qs/q', locals: { q: video.q })

  end
end