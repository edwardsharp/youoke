class ExamplesController < ApplicationController
  def index
    @channels = Channel.all
  end
end
