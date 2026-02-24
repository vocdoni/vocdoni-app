import { chakra, type HTMLChakraProps } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

const dropIn = keyframes({
  '0%, 8%': {
    transform: 'translate(44.5px, -150px)',
    opacity: 0,
  },
  '15%, 25%': {
    transform: 'translate(44.5px, -80px)',
    opacity: 1,
  },
  '35%, 100%': {
    transform: 'translate(44.5px, 60px)',
    opacity: 1,
  },
})

const morphBox = keyframes({
  '0%, 35%': {
    transform: 'scale(1) translateY(0)',
    opacity: 1,
  },
  '38%': {
    transform: 'scale(1.05, 0.95) translateY(5px)',
    opacity: 1,
  },
  '41%': {
    transform: 'scale(0.95, 1.05) translateY(-5px)',
    opacity: 1,
  },
  '45%, 100%': {
    transform: 'scale(0) translateY(0)',
    opacity: 0,
  },
})

const shadowFade = keyframes({
  '0%, 40%': {
    transform: 'scale(1)',
    opacity: 0.1,
  },
  '45%, 100%': {
    transform: 'scale(0)',
    opacity: 0,
  },
})

const checkReveal = keyframes({
  '0%, 40%': {
    transform: 'scale(0)',
    opacity: 0,
  },
  '45%': {
    transform: 'scale(1.3)',
    opacity: 1,
  },
  '50%, 100%': {
    transform: 'scale(1.2)',
    opacity: 1,
  },
})

const animationTiming = '6s forwards cubic-bezier(0.4, 0, 0.2, 1)'

type BallotBoxAnimatedProps = HTMLChakraProps<'svg'> & {
  size?: number
}

export function BallotBoxAnimated({ size = 200, ...props }: BallotBoxAnimatedProps) {
  return (
    <chakra.svg
      viewBox='0 0 400 400'
      width={size}
      height={size}
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      focusable='false'
      css={{
        '& .ballot-anim': {
          animation: `${dropIn} ${animationTiming}`,
          willChange: 'transform, opacity',
        },
        '& .box-group': {
          transformOrigin: '85px 56.5px',
          animation: `${morphBox} ${animationTiming}`,
          willChange: 'transform, opacity',
        },
        '& .checkmark-wrapper': {
          transformOrigin: '200px 185px',
          animation: `${checkReveal} ${animationTiming}`,
          willChange: 'transform, opacity',
        },
        '& .shadow-anim': {
          transformOrigin: '200px 270px',
          animation: `${shadowFade} ${animationTiming}`,
          willChange: 'transform, opacity',
        },
      }}
      {...props}
    >
      <defs>
        <clipPath id='slot-mask'>
          <rect x='-100' y='-200' width='400' height='221.5' />
        </clipPath>

        <path
          id='final-checkmark'
          d='M58.9138 23C61.6086 25.3461 64.4206 27.7928 67 30.2634C59.9459 38.32 52.9353 46.4155 45.9681 54.5492C42.1843 58.9676 38.2436 63.7861 34.2843 68C32.9877 66.6857 25.2401 59.248 24.6957 58.2477C23.4929 57.2408 22.0782 55.7224 20.9598 54.5737C19.0063 52.9387 15.9031 49.6285 14 47.7036C16.5691 45.0796 18.8128 42.4342 21.4651 39.843C25.411 43.6702 29.9322 48.1716 33.6938 52.1433C40.826 44.2088 47.6008 35.789 54.7385 27.8393C56.1503 26.2672 57.5588 24.6242 58.9138 23Z'
          fill='#4D4D4D'
        />
      </defs>

      {/* Shadow */}
      <ellipse className='shadow-anim' cx='200' cy='270' rx='70' ry='5' fill='#4D4D4D' opacity='0.1' />

      {/* Phase 1 */}
      <g transform='translate(115, 143)'>
        <g className='box-group'>
          {/* Box base */}
          <path
            d='M127.985 0C133.636 0.0943278 139.484 0.018736 145.15 0.0190735L161.941 25.1175C164.373 28.7067 166.84 32.2773 169.216 35.9036C169.83 36.8419 169.932 37.37 169.945 38.4753C170.028 45.2689 169.992 52.0709 169.992 58.8663L169.976 112.238L127.909 112.235L0.155354 112.24C-0.0829253 94.6686 0.107261 77.0686 0.111312 59.4957C0.112324 55.7377 -0.263321 38.6862 0.359883 36.9178C0.949674 35.2439 5.20815 29.5454 6.54265 27.539L17.6706 10.9014C19.6431 7.91291 22.8875 2.66717 25.0992 0.0190735L42.1475 0.0192413C127.985 0.00117493 42.1475 0.0194321 127.985 0Z'
            fill='#4D4D4D'
          />
          <path
            d='M41.1879 5.01015L141.046 4.99707C144.838 10.668 148.661 16.3199 152.512 21.9518C154.384 24.605 156.214 27.2885 158 29.9971L12 29.9786L28.9776 5.01015C33.2132 5.03078 37.4491 5.02994 41.6848 5.00763C41.6597 7.82458 41.6711 10.6419 41.7191 13.4587C39.6358 13.5509 37.1854 13.5006 35.0748 13.5056L34.9731 21.5073C44.5874 21.7253 55.2286 21.5073 64.9162 21.5073L135.079 21.5358L135.057 13.5006L41.7191 13.4587L41.1879 5.01015Z'
            fill='white'
          />
          <path
            d='M46.1342 39.0673L121.646 39.0706C134.649 39.0706 148.049 38.8935 161 39.089L160.976 48.977L123.958 48.987L9.05741 48.9971C9.00804 45.7038 8.99051 42.4089 9.00483 39.1141C13.31 38.9921 17.9905 39.074 22.3266 39.0723L46.1342 39.0673Z'
            fill='white'
          />

          {/* Logo */}
          <g transform='translate(17.8, 37.2) scale(0.07)'>
            <path
              d='M1110.01 560.396L959.988 647.018L809.994 560.42L660 473.799V623.817L809.994 710.414L959.988 797.012L1109.98 710.414L1260 623.817V473.799L1110.01 560.396Z'
              fill='white'
            />
            <path d='M1027.97 283.824L877.975 370.422V520.439L1027.97 433.818V283.824Z' fill='white' />
          </g>

          {/* Ballot paper + mask */}
          <g clipPath='url(#slot-mask)'>
            <g className='ballot-anim'>
              <path
                d='M0.119762 0L80.9905 0.00209999L81 91.976L0.0865215 92L0.0710808 32.4238C0.0688538 21.9488 -0.116143 10.406 0.119762 0Z'
                fill='#4D4D4D'
              />
              <path
                d='M5.22903 4.11068C12.7572 3.88053 21.4653 4.08105 29.1011 4.079L76.9532 4.06878L76.9601 59.9742L76.9688 78.144C76.9688 79.41 77.1289 87.3317 76.7235 87.9211C72.6959 88.0659 68.0401 87.9671 63.9603 87.9671H40.6468H18.2271C13.9857 87.9671 9.2793 88.0642 5.06792 87.8972L5.06757 25.1574C5.06792 22.9257 4.83618 5.16197 5.22903 4.11068Z'
                fill='white'
              />
              <use href='#final-checkmark' />
            </g>
          </g>
        </g>
      </g>

      {/* Phase 2 */}
      <g className='checkmark-wrapper'>
        <g transform='translate(200, 185) scale(2)'>
          <use href='#final-checkmark' transform='translate(-40.5, -45.5)' />
        </g>
      </g>
    </chakra.svg>
  )
}
