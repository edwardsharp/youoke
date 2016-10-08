module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      logger.add_tags 'ActionCable', current_user.name
    end

    protected
      def find_verified_user
        if verified_user = User.find_by(id: cookies.signed[:user_id].to_i)
          verified_user
        else
          Rails.logger.debug "\n\n REJECT UNAUTHORIZED CONN, cookies.signed[:user_id]: #{cookies.signed[:user_id]}  \n\n"
          # Rails.logger.debug "\ncookies.permanent: #{cookies.permanent.inspect}\n\n"
          reject_unauthorized_connection
        end
      end
  end
end
