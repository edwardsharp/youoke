Rails.application.routes.draw do
  resource  :session
  resources :youoke

  resources :channels do
    resources :comments
    resources :videos
  end

  root 'youoke#index'
end
