# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20161003192810) do

  create_table "channels", force: :cascade do |t|
    t.integer  "user_id"
    t.string   "title"
    t.string   "slug"
    t.text     "content"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["user_id"], name: "index_channels_on_user_id"
  end

  create_table "comments", force: :cascade do |t|
    t.integer  "channel_id"
    t.integer  "user_id"
    t.text     "content"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["channel_id"], name: "index_comments_on_channel_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "qs", force: :cascade do |t|
    t.integer  "channel_id"
    t.string   "q"
    t.integer  "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["channel_id"], name: "index_qs_on_channel_id"
  end

  create_table "users", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "videos", id: :string, force: :cascade do |t|
    t.integer  "channel_id"
    t.integer  "user_id"
    t.integer  "q_id"
    t.string   "title"
    t.integer  "plays"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["channel_id"], name: "index_videos_on_channel_id"
    t.index ["id"], name: "index_videos_on_id", unique: true
    t.index ["id"], name: "sqlite_autoindex_videos_1", unique: true
    t.index ["q_id"], name: "index_videos_on_q_id"
    t.index ["user_id"], name: "index_videos_on_user_id"
  end

end
