<?php

header('Access-Control-Allow-Origin: '.$origin);
header('Location: https://tools.frobeen.com/questions/index.php');

$HTML_PAGE = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <title>Page Title</title>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <link rel='stylesheet' type='text/css' media='screen' href='../main.css'>
        <link rel='stylesheet' type='text/css' media='screen' href='main.css'>
    </head>
    <body>
        <h1>Questions</h1>
        <form action="./questionsMain.php" method="post">
            <input type="text" id="name" name="name" placeholder="Name" required>
            <br>
            <input type="email" id="email" name="email" placeholder="E-Mail" required>
            <br>
            <textarea id="question" name="question" placeholder="Ask the question here..." required></textarea>
            <br>
            <input type="submit" value="Submit">
        </form>
    </body>
</html>

`;

$ERROR_PAGE = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <title>Page Title</title>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <link rel='stylesheet' type='text/css' media='screen' href='../main.css'>
        <link rel='stylesheet' type='text/css' media='screen' href='main.css'>
    </head>
    <body>
        <h1 class='error'>Questions</h1>
        <p class='error'>There was an error</p>
        <p class='error'>%ERRORMESSAGE%</p>
        <a href="./index.php">Go back</a>
    </body>
</html>
`;

$SUCCESS_PAGE = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <title>Page Title</title>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <link rel='stylesheet' type='text/css' media='screen' href='../main.css'>
        <link rel='stylesheet' type='text/css' media='screen' href='main.css'>
    </head>
    <body>
        <h1 class='success'>Questions</h1>
        <p class='success'>Question submitted</p>
        <a href="./index.php">Go back</a>
    </body>
</html>
`;

if(!isset($_POST["name"]) && !isset($_POST["email"]) && !isset($_POST["question"])){
    echo $HTML_PAGE;
}

if(!isset($_POST["name"])){
    echo str_replace("%ERRORMESSAGE%", "Name is required", $ERROR_PAGE);
}

if(!isset($_POST["email"])){
    echo str_replace("%ERRORMESSAGE%", "E-Mail is required", $ERROR_PAGE);
}

if(!isset($_POST["question"])){
    echo str_replace("%ERRORMESSAGE%", "Question is required", $ERROR_PAGE);
}

$name = $_POST["name"];
$email = $_POST["email"];
$question = $_POST["question"];

if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
    echo str_replace("%ERRORMESSAGE%", "E-Mail is not valid", $ERROR_PAGE);
}

if(!file_exists("questions.json")){
    file_put_contents("questions.json", "[]");
}

$questions = json_decode(file_get_contents("questions.json"), true);

$questions[] = [
    "name" => $name,
    "email" => $email,
    "question" => $question
];

file_put_contents("questions.json", json_encode($questions));

