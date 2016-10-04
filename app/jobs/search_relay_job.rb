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
        return
      end
    rescue Yt::Errors::NoItems => e
      #nbd. there really doesnot seem to be a safe way to check if a video actually exists.
    end

    videos = Yt::Collections::Videos.new
    videos.where(q: q, safe_search: 'none').take(10) 

    search = videos.map{|v| {id: v.id, title: v.title, description: v.description, thumbnail_url: v.thumbnail_url }}

    ActionCable.server.broadcast "channels:#{user_id}:search",
      search: QsController.render(partial: 'qs/result', locals: { search: search, channel: channel })
  end
end
