Rails.application.routes.draw do
  root "members#index"
  get 'tube_vids', to: 'tube_vids#index'
  post "dl", to: "documents#download"
  get '@admin_entry', to: "members#admin_entry"
  post "admin_login", to: "members#admin_login"
  get "@admin_logout", to: "members#admin_logout"
  get 'members', to: 'members#index'
  get 'documents', to: 'documents#index'
  get 'tube_vidss', to: 'tube_vidss#index'
  get 'manual', to: 'members#manual'
  namespace :ceb9458d5364668953b05327205aa8af do
    get 'manual', to: 'members#manual'
    root "members#index"
    get 'get_logs', to: 'members#get_logs'
    resources :tags
    resources :members, except: [:destroy, :new, :edit]
    post 'del/:id', to: 'members#destroy'
    post 'dead_tube', to: 'tube_vids#destroy'
    post 'tag_del', to: 'documents#tag_del'
    post 'tag_create', to: 'documents#tag_create'
    post 'tag_toggle', to: 'documents#tag_toggle'
    resources :documents, except: [:new,:show,:edit,:create, :destroy]
    post "upload", to: "documents#upload"
    resources :tube_vids, except: [:show,:new,:edit]
    post "rm", to: 'documents#remove'
    patch 'rename', to: 'documents#rename'
    patch 'rename_tag', to: 'documents#rename_tag'
    post 'change_password', to: 'members#change_password'
    patch 'alter_order', to: 'members#alter_order'
  end
end
