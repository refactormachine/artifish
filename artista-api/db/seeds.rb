# Filter colors
def create_color_from_hex(hex_color)
  m = hex_color.match /#(..)(..)(..)/
  AppColor.find_or_create_by!(r: m[1].hex, g: m[2].hex, b: m[3].hex)
end
hex_colors = ['#bcb7b0', '#000000', '#0c2c53', '#444a6d', '#6f7072', '#8196b5', '#a4c1e2', '#1797b8', '#00a7ed', '#0e59e1', '#2f29e7', '#7327e7', '#c55c9c', '#cd3846', '#e1947f', '#fcd1c2', '#e69f55', '#efd05e', '#ae985d', '#9abe45', '#1ec6b7', '#bdfdfc']
hex_colors.each { |hex_color| create_color_from_hex(hex_color) }

# Actions
Action.find_or_create_by!(name: Action::RESULT_SETS)
Action.find_or_create_by!(name: Action::ENLARGED_IMAGE)
Action.find_or_create_by!(name: Action::ADD_IMAGE_TO_COLLECTION)
Action.find_or_create_by!(name: Action::REMOVE_IMAGE_FROM_COLLECTION)
Action.find_or_create_by!(name: Action::PROCEEDED_TO_PURCHASE)
Action.find_or_create_by!(name: Action::SEARCH_PERFORMED)
Action.find_or_create_by!(name: Action::MOVE_PAGE)
