#Lights

## Running with **forever**

	$ sudo forever -w start lights.js --all

## Install with **forever-service**

	$ sudo forever-service install lights --script lights.js --scriptOptions " --all" --foreverOptions " "

## Controlling the service

	$ sudo service lights stop
	$ sudo service lights start
