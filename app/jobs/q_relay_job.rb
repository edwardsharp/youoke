class QRelayJob < ApplicationJob
  def perform(video)
    
    video.update_column :position, video.q.q_length + 1

    ActionCable.server.broadcast "channels:#{video.q.channel_id}:qs",
      q: QsController.render(partial: 'qs/q', locals: { q: video.q })

    # system('youtube-dl', "-o#{Rails.root.join('public', 'videos')}/%(id)s.%(ext)s", video.id)
    output = `youtube-dl -o"#{Rails.root.join('public', 'videos')}/%(id)s.%(ext)s" "#{video.id}"`
    
    if(!output.match(/.*Merging\ formats\ into\ (.+)/).nil?)
      file_path = output.match(/.*Merging\ formats\ into\ (.+)/)[1].gsub(/"/,'').gsub(/\\/,'')
    elsif(!output.match(/.*\[download\] +([^\ ]*)/).nil?)
      file_path = output.match(/.*\[download\] +([^\ ]*)/)[1]
    end
    
    if !file_path.nil? and File.file?(file_path)
      video.update_column :file_path, file_path
    end

    ActionCable.server.broadcast "channels:#{video.q.channel_id}:qs",
      q: QsController.render(partial: 'qs/q', locals: { q: video.q.reload })

  end
end