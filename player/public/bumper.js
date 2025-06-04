function hide() {
  bumper.canvas.classList.add('hidden')
}

function wrapText(text, fontSize) {
  bumper.ctx.font = `${fontSize}px 'VCR OSD Mono'`
  const words = text.split(' ')
  const lines = []
  let line = ''

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + ' '
    let testWidth = bumper.ctx.measureText(testLine).width

    if (testWidth > bumper.maxWidth && i > 0) {
      lines.push(line.trim())
      line = words[i] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line.trim())
  return lines
}

function render(messages, startIndex, done) {
  bumper.messages = messages
  console.log('zomg gonna start bumperz! bumper:', bumper)
  bumper.canvas.classList.remove('hidden')
  const messageIndex = Number(startIndex) || 0
  const text = messages[messageIndex]
  bumper.fontSize = 10

  // calculate biggest font size
  while (true) {
    const testLines = wrapText(text, bumper.fontSize)
    const totalHeight = testLines.length * bumper.fontSize * 1.2
    const widestLine = Math.max(
      ...testLines.map((line) => bumper.ctx.measureText(line).width)
    )

    if (widestLine > bumper.maxWidth || totalHeight > bumper.maxHeight) {
      bumper.fontSize -= 2
      bumper.lines = wrapText(text, bumper.fontSize)
      break
    }

    bumper.fontSize += 2
  }

  // clear canvas
  bumper.ctx.fillStyle = '#000000'
  bumper.ctx.fillRect(0, 0, bumper.canvas.width, bumper.canvas.height)

  const totalHeight = bumper.lines.length * bumper.fontSize * 1.2
  const baseY = (bumper.canvas.height - totalHeight) / 2 + bumper.fontSize

  let scanX = 0
  let scanY = 0
  const stepX = 25
  const stepY = 25
  const delay = 10

  function scanFrame() {
    bumper.ctx.save()
    bumper.ctx.font = `${bumper.fontSize}px 'VCR OSD Mono'`
    bumper.ctx.fillStyle = 'white'
    bumper.ctx.shadowColor = 'magenta'
    bumper.ctx.shadowBlur = parseInt(Math.random() * 69)

    bumper.ctx.beginPath()
    bumper.ctx.rect(0, 0, scanX, scanY)
    bumper.ctx.clip()

    bumper.lines.forEach((line, i) => {
      const lineWidth = bumper.ctx.measureText(line).width
      const x = (bumper.canvas.width - lineWidth) / 2
      const y = baseY + i * bumper.fontSize * 1.2
      bumper.ctx.fillText(line, x, y)
    })

    bumper.ctx.restore()

    scanX += stepX
    if (scanX > bumper.canvas.width) {
      scanX = 0
      scanY += stepY
    }

    if (scanY <= bumper.canvas.height) {
      setTimeout(scanFrame, delay)
    } else {
      // pause before complete (or starting again)
      if (messageIndex + 1 < messages.length) {
        setTimeout(() => bumper.render(messages, messageIndex + 1, done), 1000)
      } else {
        setTimeout(() => {
          console.log('zee bumperz are done and done ANDAND !!done:', !!done)
          done && bumper.hide()
          done && done()
        }, 1000)
      }
    }
  }

  scanFrame()
}

function setup() {
  const canvas = document.getElementById('bumper')
  const ctx = canvas.getContext('2d')
  const maxWidth = canvas.width * 0.9
  const maxHeight = canvas.height * 0.9

  let fontSize = 10
  let lines = []

  bumper = {
    ...bumper,
    canvas,
    ctx,
    maxWidth,
    maxHeight,
    fontSize,
    lines,
  }
}

const DEMO_MESSAGES = [
  'DO: SWEET EMOTIONZ IN THE NIGHT; END;',
  'DANCING THROUGH DIGITAL STORMZ && LOVE',
  'THE FUTURE IN A VHS DREAM',
]

let bumper = {
  setup,
  render,
  hide,
  DEMO_MESSAGES,
}
