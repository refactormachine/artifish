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

ActiveRecord::Schema.define(version: 2018_08_23_071425) do

  create_table "active_storage_attachments", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "collection_items", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name"
    t.string "image_url"
    t.string "item_url"
    t.integer "price_cents", default: 0, null: false
    t.string "price_currency", default: "USD", null: false
    t.bigint "collection_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "portfolio_item_id"
    t.text "position_attributes"
    t.index ["collection_id"], name: "index_collection_items_on_collection_id"
    t.index ["portfolio_item_id"], name: "index_collection_items_on_portfolio_item_id"
  end

  create_table "collections", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_collections_on_user_id"
  end

  create_table "colors", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.integer "r"
    t.integer "g"
    t.integer "b"
    t.float "h"
    t.float "s"
    t.float "l"
  end

  create_table "materials", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "material_type", null: false
    t.boolean "enabled", default: false
    t.index ["enabled"], name: "index_materials_on_enabled"
    t.index ["material_type", "name"], name: "index_materials_on_material_type_and_name", unique: true
  end

  create_table "order_items", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name"
    t.string "image_url"
    t.string "product_url"
    t.bigint "purchase_option_id"
    t.integer "price_cents", default: 0, null: false
    t.string "price_currency", default: "USD", null: false
    t.bigint "order_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "product_identifier"
    t.index ["order_id"], name: "index_order_items_on_order_id"
    t.index ["purchase_option_id"], name: "index_order_items_on_purchase_option_id"
  end

  create_table "orders", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.string "city"
    t.string "address"
    t.string "zip_code"
    t.string "phone_number"
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_orders_on_user_id"
  end

  create_table "paypal_transactions", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "token"
    t.string "payer"
    t.string "processor_authorization_code"
    t.integer "amount_cents", default: 0, null: false
    t.string "amount_currency", default: "USD", null: false
    t.boolean "success"
    t.bigint "order_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_paypal_transactions_on_order_id"
    t.index ["token"], name: "index_paypal_transactions_on_token", unique: true
  end

  create_table "portfolio_item_colors", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "portfolio_item_id", null: false
    t.bigint "color_id", null: false
    t.integer "dominance_index", null: false
    t.integer "dominance_weight", null: false
    t.index ["color_id", "portfolio_item_id"], name: "index_portfolio_item_colors_on_color_id_and_portfolio_item_id"
    t.index ["portfolio_item_id", "color_id"], name: "index_portfolio_item_colors_on_portfolio_item_id_and_color_id", unique: true
  end

  create_table "portfolio_items", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name"
    t.string "product_identifier"
    t.string "product_url"
    t.bigint "supplier_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_portfolio_items_on_name"
    t.index ["supplier_id", "product_identifier"], name: "index_portfolio_items_on_supplier_id_and_product_identifier", unique: true
    t.index ["supplier_id"], name: "index_portfolio_items_on_supplier_id"
  end

  create_table "portfolio_items_tags", id: false, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "tag_id", null: false
    t.bigint "portfolio_item_id", null: false
    t.index ["portfolio_item_id", "tag_id"], name: "index_portfolio_items_tags_on_portfolio_item_id_and_tag_id"
    t.index ["tag_id", "portfolio_item_id"], name: "index_portfolio_items_tags_on_tag_id_and_portfolio_item_id"
  end

  create_table "purchase_options", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "material_id"
    t.bigint "size_id"
    t.bigint "portfolio_item_id"
    t.integer "price_cents", default: 0, null: false
    t.string "price_currency", default: "USD", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["material_id"], name: "index_purchase_options_on_material_id"
    t.index ["portfolio_item_id"], name: "index_purchase_options_on_portfolio_item_id"
    t.index ["size_id"], name: "index_purchase_options_on_size_id"
  end

  create_table "sizes", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_sizes_on_name", unique: true
  end

  create_table "suppliers", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_suppliers_on_name", unique: true
  end

  create_table "tags", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "users", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.boolean "is_verified"
    t.string "verification_code"
    t.string "first_name"
    t.string "last_name"
    t.string "provider", default: "email", null: false
    t.string "uid", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email", "provider"], name: "index_users_on_email_and_provider", unique: true
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
  end

  add_foreign_key "collection_items", "collections"
  add_foreign_key "collections", "users"
  add_foreign_key "order_items", "orders"
  add_foreign_key "order_items", "purchase_options"
  add_foreign_key "orders", "users"
  add_foreign_key "paypal_transactions", "orders"
  add_foreign_key "portfolio_items", "suppliers"
  add_foreign_key "purchase_options", "materials"
  add_foreign_key "purchase_options", "portfolio_items"
  add_foreign_key "purchase_options", "sizes"
end
