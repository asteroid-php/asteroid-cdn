<?php
	require_once __DIR__ . '/vendor/autoload.php';
	ini_set("display_errors", false);
	
	// Parse an scss file
	$url = isset($_GET["url"]) ? $_GET["url"] : "";
	$realpath = realpath(__DIR__ . "/" . $url);
	$path = realpath(__DIR__ . "/" . preg_replace("/(\\.min)(\\.scss)$/i", "$2", $url));
	if(!is_string($path) || (strpos($path, __DIR__) !== 0) || !is_string($content = file_get_contents($path))) {
		header("HTTP/1.1 404 Not Found");
		echo "404 Not Found";
	} $debugging = !isset($_GET["debug"]) || ($_GET["debug"] == "true") ? true : false;
	$cache = ($debugging === true) || !isset($_GET["cache"]) || ($_GET["cache"] == "false") ? false : true;
	$minified = (strtolower(substr($url, -9, 4)) == ".min") ? true : false;
	
	// Get a cached copy
	$cachepath = $realpath . "-" . md5($content) . ($minified ? ".min" : "") . ".css";
	if(($cache === true) && is_string($compiled = file_get_contents($cachepath))) {
		header("Content-Type: text/css");
		echo $compiled;
	}
	
	$scss = new Leafo\ScssPhp\Compiler();
	$scss->setImportPaths(Array(__DIR__, dirname($path)));
	if($minified === true) // Minified output?
		$scss->setFormatter("Leafo\\ScssPhp\\Formatter\\Crunched");
	if($debugging === true) // Debugging output?
		$scss->setLineNumberStyle(Leafo\ScssPhp\Compiler::LINE_COMMENTS);
	
	$compiled = $scss->compile($content, $path);
	if($cache === true) file_put_contents($cachepath, $compiled);
	
	// Output the compiled content as css
	header("Content-Type: text/css");
	echo $compiled;
	