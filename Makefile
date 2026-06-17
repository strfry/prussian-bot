build:
	CGO_ENABLED=0 go build -o prussian-bot -ldflags="-s -w" .

run: build
	./prussian-bot

clean:
	rm -f prussian-bot

deploy: build
	ssh strfry@strfry.org supervisorctl stop prussian-bot
	scp prussian-bot strfry@strfry.org:bin/
	ssh strfry@strfry.org supervisorctl start prussian-bot
