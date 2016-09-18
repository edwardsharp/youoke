Rails.application.routes.draw do
  resource  :session
  resources :examples

  resources :channels do
    resources :comments
  end

  root 'examples#index'
end
