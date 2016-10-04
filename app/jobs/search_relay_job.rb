class SearchRelayJob < ApplicationJob
  def perform(channel: nil, user_id: nil, q: nil)

    videos = Yt::Collections::Videos.new
    videos.where(q: q, safe_search: 'none').take(10) 

    search = videos.map{|v| {id: v.id, title: v.title, description: v.description, thumbnail_url: v.thumbnail_url }}

    ActionCable.server.broadcast "channels:#{user_id}:search",
      search: QsController.render(partial: 'qs/result', locals: { search: search, channel: channel })
  end
end
