vim.g.lazyvim_ts_lsp = "tsc"

return {
	{ import = "lazyvim.plugins.extras.lang.typescript" },
	{ import = "lazyvim.plugins.extras.lang.typescript.tsc" },
	{ import = "lazyvim.plugins.extras.lang.typescript.oxc" },
	{
		"neovim/nvim-lspconfig",
		opts = {
			servers = {
				oxlint = {
					cmd = { "oxlint", "--lsp" },
				},
			},
		},
	},
	{
		"stevearc/conform.nvim",
		optional = true,
		opts = {
			formatters = {
				oxfmt = {
					command = "oxfmtbin",
					args = { "$FILENAME" },
					stdin = false,
				},
			},
		},
	},
}
