Rails.application.routes.draw do
  resource  :session
  resources :youoke

  resources :channels do
    get 'player', to: 'channels#player', as: :player
    resources :comments
    resources :videos
    post 'search', to: 'qs#search', as: :qs
    post 'add_video_to_q', to: 'qs#add_video_to_q', as: :add_video_to_q
  end

  root 'youoke#index'
end
