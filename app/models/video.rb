class Video < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :q, optional: true

  after_commit :q_relay, on: :create
  # after_commit :calc_position, on: :update

  def q_relay
    QRelayJob.perform_later(self)
  end

  def download
    # system('youtube-dl', "-o#{Rails.root.join('public', 'videos')}/%(id)s.%(ext)s", video.id)
    output = `youtube-dl -o"#{Rails.root.join('public', 'videos')}/%(id)s.%(ext)s" "#{id}"`
    
    Rails.logger.debug "\n\n[youtube-dl] output: #{output}\n\n"

    if(!output.match(/.*Merging\ formats\ into\ (.+)/).nil?)
      path = output.match(/.*Merging\ formats\ into\ (.+)/)[1].gsub(/"/,'').gsub(/\\/,'')
    elsif(!output.match(/.*\[download\] +([^\ ]*)/).nil?)
      path = output.match(/.*\[download\] +([^\ ]*)/)[1]
    end

    unless path.nil?
      path = Dir["#{Rails.root.join('public', 'videos')}/*"].select { |e| e =~ /#{id}/ }[0]
    end
    
    if !path.nil? and File.file?(path)
      update_column :file_path, path
    else
      #destroy this video record?
      Rails.logger.debug "\n\n[youtube-dl] ERROR could not figure out a filepath!\n\n"
      update_column :position, nil
    end
  end

end
