Rails.application.routes.draw do
  resource  :session
  resources :youoke

  resources :channels do
    resources :comments
    resources :videos
    post 'search', to: 'qs#search', as: :qs
  end

  root 'youoke#index'
end
