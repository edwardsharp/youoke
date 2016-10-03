class SearchRelayJob < ApplicationJob
  def perform(user_id: nil, q: nil)

    search = Yt::Collections::Videos.new
    search.where(q: q, safe_search: 'none').take(10) 

    ActionCable.server.broadcast "channels:#{user_id}:search",
      search: QsController.render(partial: 'qs/result', locals: { search: search.map(&:title) })
  end
end
