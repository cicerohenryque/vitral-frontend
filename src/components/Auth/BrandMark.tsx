import heroImg from '../../assets/hero.png'
import './BrandMark.css'

export function BrandMark() {
  return (
    <header className="brand-mark" aria-label="Vitral">
      <span className="brand-ring">
        <img src={heroImg} alt="" />
      </span>
    </header>
  )
}
