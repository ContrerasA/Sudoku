// Copyright Anthony Contreras only

import './App.css';

// import sudoku from 'sudoku';
import { getSudoku } from 'sudoku-gen';
import { useEffect, useState } from 'react';
import { RxTransparencyGrid } from 'react-icons/rx'
import { SlNote, SlNotebook } from 'react-icons/sl';
import { AiOutlineClose } from 'react-icons/ai';
import { TfiLayoutGrid3Alt } from 'react-icons/tfi';
import { CgLoadbar } from 'react-icons/cg';




function App() {

	const [selectedCell, setSelectedCellIndex] = useState(-1);
	const [sudoku, setSudoku] = useState();
	const [highlightedNumber, setHighlightedNumber] = useState(-1);
	const [gameOptions, setGameOptions] = useState({
		difficulty: 'easy',
	});
	const [userOptions, setUserOptions] = useState({
		notesEnabled: false,
		checkerboardPattern: true
	});
	const [gameStats, setGameStats] = useState({
		mistakes: 0,
		timeStarted: new Date(),
		timeEnded: null
	})
	// TODO: To be used for undos
	const [stateHistory, setStateHistory] = useState({});

	function GeneratePuzzle() {
		let rawSudoku = getSudoku(gameOptions.difficulty);
		let numberOfCells = 81;

		let splitPuzzle = rawSudoku.puzzle.split('');
		let splitSolution = rawSudoku.solution.split('');

		rawSudoku.puzzle = convertStringArrayToNumericalArray(splitPuzzle);
		rawSudoku.solution = convertStringArrayToNumericalArray(splitSolution);

		let newPuzzle = [];

		// iterate through all
		for (let i = 0; i < numberOfCells; i++) {
			let tempObject = {
				index: i,
				row: determineRow(i),
				column: determineColumn(i),
				currentVal: rawSudoku.puzzle[i],
				defaultVal: rawSudoku.puzzle[i],
				solutionValue: rawSudoku.solution[i],
				notes: []
			}
			newPuzzle.push(tempObject);
		}

		setSudoku(newPuzzle);
	}

	function convertStringArrayToNumericalArray(inStringArray) {
		let newArray = [];
		inStringArray.map((el, index) => {
			let currentVal = Number.parseInt(el);
			let currentInt = Number.isInteger(currentVal) ? currentVal : -1;
			return newArray[index] = currentInt;
		})

		return newArray;
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

	function determineStartingBackgroundColor(cell) {

		if (selectedCell === cell.index)
			return 'bg-blue-200';


		if (userOptions.checkerboardPattern) {
			// Rows 0, 1, 2, 6, 7, 8
			if ((cell.row <= 2 || cell.row >= 6) && (cell.column <= 2 || cell.column >= 6))
				return 'bg-gray-300';
			// Rows 3, 4, 5
			if ((cell.row >= 3 && cell.row <= 5) && (cell.column >= 3 && cell.column <= 5))
				return 'bg-gray-300';
		}

		return 'bg-gray-100';
	}

	function determineBottomBorder(cell) {
		if (cell.row === 2 || cell.row === 5)
			return "border-b-2 border-black";

		return '';
	}

	function determineTextColor(cell) {
		if (cell.currentVal !== cell.solutionValue)
			return 'text-red-600';

		else if (cell.currentVal === highlightedNumber)
			return 'text-cyan-500';

		return 'text-black'
	}

	function determineFontBold(cell) {
		if (cell.currentVal === highlightedNumber || (cell.currentVal !== cell.solutionValue))
			return 'font-bold';
		return '';
	}


	function setPuzzleValue(cell, number) {
		let tempPuzzle = JSON.parse(JSON.stringify(sudoku));
		tempPuzzle[cell.index].currentVal = number;
		setSudoku(tempPuzzle);
	}

	function addNoteToCell(cell, number) {
		let tempPuzzle = JSON.parse(JSON.stringify(sudoku));
		let cellNotes = tempPuzzle[cell.index].notes;
		if (!cellNotes.includes(number)) {
			cellNotes.push(number);
			cellNotes.sort((a, b) => a - b);
		}
		tempPuzzle[cell.index].notes = cellNotes;
		console.log(tempPuzzle[cell.index]);
		setSudoku(tempPuzzle);
	}

	function handleNumberSubmitted(number) {
		let cell = sudoku[selectedCell];
		// Make sure cell is selected
		if (selectedCell !== -1) {
			// If not a default cell
			if (cell.defaultVal === -1) {
				// If correct solution is not already entered
				if (cell.currentVal !== cell.solutionValue) {
					// if notes are enabled
					if (userOptions.notesEnabled) {
						addNoteToCell(cell, number);
					} else {
						setPuzzleValue(cell, number);
						setHighlightedNumber(number);
						if (number !== cell.solutionValue) {
							setGameStats(prevState => ({
								...prevState,
								mistakes: prevState.mistakes + 1
							}))
						}
					}
				}
			}
		}
	}

	function handleClickOnCell(cell) {
		setSelectedCellIndex(cell.index);
		if (cell.currentVal !== -1)
			setHighlightedNumber(cell.currentVal);

		// Removed to keep last number selected highlighted
		// else
		// 	setHighlightedNumber(-1);
	}

	function clear() {
		setSelectedCellIndex(-1);
		setHighlightedNumber(-1);
	}

	function toggleGridBackground() {
		let checkerboardPattern = !userOptions.checkerboardPattern;
		setUserOptions(prevState => ({
			...prevState,
			checkerboardPattern
		}))
	}


	function toggleUserNotes() {
		let notes = !userOptions.notesEnabled;
		setUserOptions(prevState => ({
			...prevState,
			notesEnabled: notes
		}))
	}

	function removeEntryInSelectedCell() {
		let cell = sudoku[selectedCell];
		if (cell.currentVal > -1 && cell.defaultVal === -1 && cell.currentVal !== cell.solutionValue) {
			let tempPuzzle = JSON.parse(JSON.stringify(sudoku));
			tempPuzzle[cell.index].currentVal = -1;
			setSudoku(tempPuzzle);
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
		<div className="App cursor-default select-none">

			<div className='flex justify-center items-center'>
				<span className='text-4xl'>Co</span>
				<span className='text-4xl font-semibold text-red-500'>-</span>
				<span className='text-4xl'>Doku</span>
			</div>

			{/* Puzzle */}
			<div className="flex justify-center">
				<table className='m-4'>
					<colgroup><col /><col /><col /></colgroup>
					<colgroup><col /><col /><col /></colgroup>
					<colgroup><col /><col /><col /></colgroup>

					<tbody className='border-2 border-gray-900'>
						{
							sudoku && [...Array(9)].map((el, rowIndex) => (
								<tr key={rowIndex}>
									{
										[...Array(9)].map((el, colIndex) => {
											let index = getIndexFromRowAndColumn(rowIndex, colIndex);
											let cell = sudoku[index];
											return (
												<td key={colIndex} className='w-12 h-12 relative' onClick={() => handleClickOnCell(cell)}>
													{/* Notes */}
													{
														cell.currentVal === -1 &&
														<div className='absolute w-full h-full top-0 left-0'>
															<div className='flex flex-wrap'>
																{
																	[...Array(9)].map((el, noteIndex) => (
																		<div key={noteIndex} className=' basis-[33%] text-xs w-4 h-4'>{cell.notes.includes(noteIndex + 1) ? noteIndex + 1 : ' '}</div>
																	))
																}
															</div>
														</div>

													}
													{/* Current Value */}
													<div className={`w-full h-full flex justify-center items-center
														${determineStartingBackgroundColor(cell)}
														${determineFontBold(cell)}
														${determineBottomBorder(cell)}
														${determineTextColor(cell)}
													`}

													>
														{cell.currentVal !== -1 ? cell.currentVal : ''}
													</div>
												</td>
											)
										})
									}
								</tr>
							))}
					</tbody>
				</table>
			</div>

			{/* Options */}
			<div className='flex justify-center items-center space-x-6'>

				{/* Toggle grid background */}
				<div onClick={() => toggleGridBackground()} className='flex justify-center items-center'>
					<TfiLayoutGrid3Alt color={userOptions.checkerboardPattern ? '#448ead' : '#9c9c9c'} className='h-6 w-6' />
				</div>

				{/* Toggle notes */}
				<div onClick={() => toggleUserNotes()} className='flex justify-center items-center'>
					<SlNote color={userOptions.notesEnabled ? '#448ead' : '#9c9c9c'} className='h-6 w-6' />
				</div>
			</div>
		</div >
	);
}

export default App;
