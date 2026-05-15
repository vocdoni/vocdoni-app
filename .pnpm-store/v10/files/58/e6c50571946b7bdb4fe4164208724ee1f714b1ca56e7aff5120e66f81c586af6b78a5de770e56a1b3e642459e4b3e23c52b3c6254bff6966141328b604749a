import * as assert from 'assert'
import * as BigInteger from 'bigi'
import { keccak256 } from '@ethersproject/keccak256'

import { pointFromHex, newKeyPair, newRequestParameters, blind, blindSign, unblind, verify, signatureFromHex, signatureToHex, messageToBigNumber, pointToHex, ecparams, newBigFromString, evenHex } from '../src/index'

describe('keccak256', function () {
	it('should hash strings and big numbers', async () => {
		const m = BigInteger.fromBuffer(Buffer.from('test', 'utf8'))
		const mHex = m.toString(16)
		const hHex = keccak256('0x' + mHex)
		assert.strictEqual('0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658', hHex)
		const h = BigInteger.fromHex(hHex.slice(2))
		assert.strictEqual('70622639689279718371527342103894932928233838121221666359043189029713682937432', h.toString())
	})
})

describe('test blind', function () {
	it('should blind', async () => {
		const { sk, pk } = newKeyPair()

		const { k, signerR } = newRequestParameters()

		const msg = BigInteger.fromBuffer(
			Buffer.from('test', 'utf8')
		)
		assert.strictEqual('1952805748', msg.toString())

		const { mBlinded, userSecretData } = blind(msg, signerR)

		const sBlind = blindSign(sk, mBlinded, k)

		const sig = unblind(sBlind, userSecretData)

		const verified = verify(msg, sig, pk)
		assert(verified)
	})
})

describe('import point from hex', function () {
	it('should import a point', async () => {
		// pointHex and expected values was generated from
		// go-blindsecp256k1 (Point.Bytes())
		const pointHex = '73a68e845e626a2d7f683dd2ceb57956f755d623c0b729af30a72c7bf4dee7a6932d08955c98cf21edf35f5df218b56c41014db06f513cecc85dc3d8671f9521'
		const p = pointFromHex(pointHex)
		assert.strictEqual('75493613315673782629634797792529672610524641864826422940379513836118869976691', p.x.toString())
		assert.strictEqual('15189800969738851359449622716277258420468338317311652509571160848111971610003', p.y.toString())

		assert.strictEqual(pointToHex(pointFromHex(pointHex)), pointHex)
	})

	it("should import a signature", () => {
		const originalSignatureHex = "36cbb281c7d3f51fa6c027c39d1ec1115e72f4cf78beda1292ef16736894f327a77b4a7e7ba7b7daa54de6a111cb69b6a89bd8c15756a3d0bc620e77b134a9be2cf4d4758c2a5c59381f30bca694b585d9bbb192d349f7220b4e414503cd7eb6"
		const { s, f } = signatureFromHex(originalSignatureHex)

		assert.strictEqual(s.toString(10), "18070569205902663717816547129479407690196063715098828904678654635357913664310")
		assert.strictEqual(f.affineX.toString(10), "86238402060026834577259540812071998074585426519937266202081591629132264536999")
		assert.strictEqual(f.affineY.toString(10), "82544976118490904161760686015396902971720732626625394239692986344240783356972")

		assert.strictEqual(signatureToHex(signatureFromHex(originalSignatureHex)), originalSignatureHex)
	})

	it("should import a signature with leading 0's on the big integers", () => {
		const originalSignatureHex = "089a89f07bd41560454b1640fd30e51ee088d1be8355275a88e38a38f2e7a3000080fcc14af9c47c8066c6726e7d3cac9370494d5c67936b2978d6cecf5a4d00003ef00b060c47ba874c0764d662eff2d0e9daa8ba766f4aa6a2be8ec3d37500"
		const { s, f } = signatureFromHex(originalSignatureHex)

		assert.strictEqual(s.toString(10), "289596905226702587911033129111285060518391679824489553383063470810094737928")
		assert.strictEqual(f.affineX.toString(10), "136673983650666514404918584888974483560635967304551499498329425981927620608")
		assert.strictEqual(f.affineY.toString(10), "208182647280612121090241159906896377333338287898138605151276081386137599488")

		assert.strictEqual(signatureToHex(signatureFromHex(originalSignatureHex)), originalSignatureHex)
	})
})

describe('Test hash m odd bytes', function () {
	it('should take odd hex value and prepare it (using evenHex) to be even for keccak256 input', async () => {
		// This test is made with same values than
		// https://github.com/arnaucube/go-blindsecp256k1 to ensure
		// compatibility
		let m = newBigFromString("3024162961766929396601888431330224482373544644288322432261208139289299439809")
		let mHex = m.toString(16)
		assert.strictEqual(57, mHex.substr(6).length)
		let hHex = keccak256('0x' + evenHex(mHex).substr(6)).substr(2)
		let h = BigInteger.fromHex(hHex)
		assert.strictEqual("57523339312508913023232057765773019244858443678197951618720342803494056599369", h.toString())

		mHex = m.toString(16) + "1234"
		assert.strictEqual(67, mHex.length)
		hHex = keccak256('0x' + evenHex(mHex)).substr(2)
		h = BigInteger.fromHex(hHex)
		assert.strictEqual("9697834584560956691445940439424778243200861871421750951058436814122640359156", h.toString())
	})
})
