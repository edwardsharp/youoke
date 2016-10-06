class SearchRelayJob < ApplicationJob
  def perform(channel: nil, user_id: nil, q: nil)

    begin
      video = Yt::Video.new id: q
      if video.title
        if Video.find_by(id: video.id).blank? 
          Video.create id: video.id, title: video.title, q: channel.q, user_id: user_id
        else
          QRelayJob.perform_later(Video.find_by(id: video.id))
        end
        ActionCable.server.broadcast "channels:#{user_id}:search",
          search: QsController.render(partial: 'qs/result', locals: { search: nil, channel: channel })
        return
      end
    rescue Yt::Errors::NoItems => e
      #nbd. there really doesnot seem to be a safe way to check if a video actually exists.
    end

    videos = Yt::Collections::Videos.new
    videos.where(q: q, safe_search: 'none') 
    # videos.where(q: q, safe_search: 'none', video_duration: 'short').where(q: q, safe_search: 'none', video_duration: 'short')
    
    search = videos.take(10).map{|v| {id: v.id, title: v.title, description: v.description, thumbnail_url: v.thumbnail_url, duration: v.duration }}

    ActionCable.server.broadcast "channels:#{user_id}:search",
      search: QsController.render(partial: 'qs/result', locals: { search: search, channel: channel })
  end
end
