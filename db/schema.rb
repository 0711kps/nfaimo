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

ActiveRecord::Schema.define(version: 20170925021553) do

  create_table "counters", force: :cascade do |t|
    t.string "name"
    t.integer "count", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "documents", force: :cascade do |t|
    t.string "title"
    t.string "local_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "extname"
    t.index ["created_at"], name: "index_documents_on_created_at"
  end

  create_table "members", force: :cascade do |t|
    t.string "name"
    t.string "title"
    t.string "resp"
    t.string "ext"
    t.string "mail"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "passwd", default: "ccceea014defbdefd3fba2a226b3615b140ed861"
    t.index ["created_at"], name: "index_members_on_created_at"
  end

  create_table "registers", force: :cascade do |t|
    t.string "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tag_docships", force: :cascade do |t|
    t.integer "tag_id"
    t.integer "document_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tags", force: :cascade do |t|
    t.string "name"
    t.integer "documents_count", default: 0
  end

  create_table "tube_vids", force: :cascade do |t|
    t.string "title"
    t.string "vid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_tube_vids_on_created_at"
  end

end