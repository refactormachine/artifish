class StaticPagesController < ActionController::Base
  def index
    render file: 'public/index.html'
  end

  def yaniv
    render file: 'public/yaniv.html'
  end
end
