push:
	@./bump.py
	@sed -i .bk "s/version=.*,/version='`cat VERSION`',/" setup.py
	@sudo ./upload.sh
