extern crate combine;
use combine::{many1, Parser, sep_by};
use combine::parser::char::{letter, space};

fn main() {
    let word = many1(letter());

    let mut parser =
        sep_by(word, space())
            .map(|mut words: Vec<String>| words.pop());
    let result = parser.parse("Pick up that word!");
    // `parse` returns `Result` where `Ok` contains a tuple of the parsers output and any remaining input.
    assert_eq!(result, Ok((Some("word".to_string()), "!")));
    println!("Hello, world!", result.unwrap());
}
