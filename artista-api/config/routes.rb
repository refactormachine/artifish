Rails.application.routes.draw do
  # User credentials login route
  post 'auth/login', to: 'authentication#authenticate'

  # OAuth login routes
  post "auth/:provider", to: "authentication#generic_oauth"

  # User credentials signup
  resources :users, only: [:create], defaults: {format: :json}
  post '/users/verify', to: 'users#verify'

  resources :collections, defaults: {format: :json} do
    resources :items, only: [:index, :create, :destroy], controller: 'collection_items', defaults: {format: :json}
  end

  resources :portfolio_items, only: [:index], defaults: {format: :json}
  resources :tags, only: [:index], defaults: {format: :json}
  resources :materials, only: [:index], defaults: {format: :json}

  post 'payments/generate_paypal_link', to: 'payments#generate_paypal_link'

  resources :orders, only: [:create], defaults: {format: :json}

  post 'payments/paypal_transactions', to: 'payments#create', defaults: {format: :json}

  get '/location/get_locale', to: 'location#get_locale'

  post 'contact_us', to: 'contact_us#create'

  get 'static', to: 'static_pages#index'
  get 'static/yaniv', to: 'static_pages#yaniv'
end
