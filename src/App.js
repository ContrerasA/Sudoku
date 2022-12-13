import './App.css';

// import sudoku from 'sudoku';
import { getSudoku } from 'sudoku-gen';
import { useEffect, useState } from 'react';


function App() {

	const [difficulty, setDifficulty] = useState('easy');
	const [selectedCell, setSelectedCell] = useState(-1);
	const [sudoku, setSudoku] = useState();
	const [highlightedNumber, setHighlightedNumber] = useState(-1);


	function convertStringArrayToNumericalArray(inStringArray) {
		let newArray = [];
		inStringArray.map((el, index) => {
			let currentVal = Number.parseInt(el);
			let currentInt = Number.isInteger(currentVal) ? currentVal : -1;
			return newArray[index] = currentInt;
		})

		return newArray;
	}

	function GeneratePuzzle() {
		let rawSudoku = getSudoku(difficulty);

		let splitPuzzle = rawSudoku.puzzle.split('');
		let splitSolution = rawSudoku.solution.split('');


		rawSudoku.puzzle = convertStringArrayToNumericalArray(splitPuzzle);
		rawSudoku.solution = convertStringArrayToNumericalArray(splitSolution);
		rawSudoku.currentPuzzle = rawSudoku.puzzle;

		setSudoku(rawSudoku);
		console.log(rawSudoku.puzzle);
	}

	function determineRow(index) {
		return Math.floor(index / 9);
	}

	function determineColumn(index) {
		return index % 9;
	}

	function getIndexFromRowAndColumn(row, column) {
		return row * 9 + column;
	}

	function isIndexCorrect(index) {
		return sudoku.currentPuzzle[index] === sudoku.solution[index];
	}

	function isDefaultCell(index) {
		return sudoku.puzzle[index] === -1;
	}

	function determineStartingBackgroundColor(rowIndex, colIndex) {
		let index = getIndexFromRowAndColumn(rowIndex, colIndex);
		// if selected cell

		if (index === selectedCell) {
			return 'bg-blue-200'
		}

		// Rows 0, 1, 2, 6, 7, 8
		if ((rowIndex <= 2 || rowIndex >= 6) && (colIndex <= 2 || colIndex >= 6)) {
			return 'bg-gray-300'
		}
		// Rows 3, 4, 5
		if ((rowIndex >= 3 && rowIndex <= 5) && (colIndex >= 3 && colIndex <= 5))
			return 'bg-gray-300'

		return 'bg-gray-100'

	}

	function determineBottomBorder(index) {
		let row = determineRow(index);

		if (row === 2 || row === 5)
			return "border-b-2 border-black";

		return '';

	}

	function determineTextColor(index) {
		if (!isIndexCorrect(index))
			return 'text-red-600';
		else if (sudoku.currentPuzzle[index] === highlightedNumber)
			return 'text-cyan-500';

		return 'text-black'
	}

	function determineFontBold(index) {
		if (sudoku.currentPuzzle[index] === highlightedNumber) {
			return 'font-bold'
		}
		return isIndexCorrect(index) ? 'font-normal' : 'font-bold';
	}


	function setPuzzleValueAtIndex(index, value) {
		let currentPuzzle = sudoku.currentPuzzle;
		currentPuzzle[index] = value;
		setSudoku(prevState => ({
			...prevState,
			currentPuzzle
		}))

	}

	function handleNumberSubmitted(number) {
		// If empty
		if (selectedCell !== -1) {

			// If not a default cell
			if (sudoku.puzzle[selectedCell] === -1) {

				// If correct solution not already entered
				if (sudoku.currentPuzzle[selectedCell] !== sudoku.solution[selectedCell]) {
					setPuzzleValueAtIndex(selectedCell, number);
					setHighlightedNumber(number);
				}
			}
		}
	}

	function handleClickOnCell(index) {
		setSelectedCell(index);

		if (sudoku.currentPuzzle[index] !== -1) {
			setHighlightedNumber(sudoku.currentPuzzle[index]);
		} else {
			// removed to keep last number selected highlighted
			// setHighlightedNumber(-1);
		}
	}

	function clear() {
		setSelectedCell(-1);
		setHighlightedNumber(-1);
	}

	function removeEntryInSelectedCell() {
		if (selectedCell > -1 && !isDefaultCell(selectedCell)) {

			let currentPuzzle = sudoku.currentPuzzle;
			currentPuzzle[selectedCell] = -1;
			setSudoku(prevState => ({
				...prevState,
				currentPuzzle

			}));
		}
	}


	useEffect(() => {
		if (!sudoku) {
			GeneratePuzzle();
		}

		const keyDownHandler = event => {
			let number = Number.parseInt(event.key);
			if (Number.isInteger(number)) {
				handleNumberSubmitted(number);
			}

			switch (event.key) {
				case 'Escape':
					clear()
					break;
				case 'Backspace':
					removeEntryInSelectedCell();
			}

		}

		document.addEventListener('keydown', keyDownHandler);

		return () => {
			document.removeEventListener('keydown', keyDownHandler);
		}
	},);


	return (
		<div className="App cursor-default">
			<h1 className="flex justify-center">
				<table className='m-4'>
					<colgroup><col /><col /><col /></colgroup>
					<colgroup><col /><col /><col /></colgroup>
					<colgroup><col /><col /><col /></colgroup>
					<tbody className='border-2 border-gray-900'>
						{
							sudoku && [...Array(9)].map((row, rowIndex) => (
								<tr key={rowIndex}>
									{
										[...Array(9)].map((col, colIndex) => {
											let index = getIndexFromRowAndColumn(rowIndex, colIndex);
											// If number originally set
											let disabled = sudoku.puzzle[index] > -1;
											// if already correct answer
											if (disabled === false) {
												disabled = sudoku.currentPuzzle[index] === sudoku.solution[index];
											}

											return (
												<td key={colIndex} >
													<div className={`w-12 h-12 flex justify-center items-center 
														${determineTextColor(index)}
														${determineFontBold(index)} 
														${determineBottomBorder(index)}
														${determineStartingBackgroundColor(rowIndex, colIndex)}
														`}
														onClick={() => handleClickOnCell(index)}
													>{sudoku.puzzle[index] > -1 ? sudoku.puzzle[index] : ''}</div>
												</td>
											)
										}
										)}
								</tr>
							)
							)}
					</tbody>
				</table>
			</h1>
			<div className='flex justify-center space-x-3'>
				{
					[...Array(9)].map((el, index) => (
						<div key={index} className="flex justify-center items-center w-10 h-10 text-xl font-bold border rounded-full">{index + 1}</div>
					)
					)}
			</div>
		</div>
	);
}

export default App;
