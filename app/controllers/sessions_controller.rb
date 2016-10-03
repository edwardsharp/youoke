class SessionsController < ApplicationController
  skip_before_action :ensure_authenticated_user, only: %i( new create )

  def new
    unauthenticate_user
  end

  def create
    user = User.create user_params
    authenticate_user(user.id)
    redirect_to channels_path
  end

  def destroy
    unauthenticate_user
    redirect_to new_session_url
  end

  private 

  def user_params
    params.require(:user).permit(:name)
  end

end