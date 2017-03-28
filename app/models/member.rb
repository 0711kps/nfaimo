class Member < ApplicationRecord
  validates_presence_of :name, :title, :resp, :ext, :mail
  validates_uniqueness_of :mail, :ext
  before_save :n2br
  after_save :recount
  after_destroy :recount

  def n2br
    self.resp = self.resp.gsub("\n","<br>")
  end

  def recount
    Counter.update(name: 'Member', count: Member.count)
  end

  # 刪除成員時，將display_order大於自己的成員都順序-1
  # base(int) = 目標的原先位置(刪除)或插入位置(插入)
  def self.d_alter_order base
    Member.transaction do
      Member.where("display_order > #{base}").order("display_order ASC").update_all('display_order = display_order - 1')
    end
  end

  # 插入時，插入位置以後的都+1(先將自己設定爲-1避免重複)
  def i_alter_order change_amount
    begin
      Member.transaction do
        origin_order = self.display_order
        self.update(display_order: -1)
        if change_amount > 0 # 向下
          Member.where("display_order > ? and display_order < ?", origin_order, origin_order + change_amount + 1).update_all("display_order=display_order-1")
        else # 向上
          Member.where("display_order < ? and display_order > ?", origin_order, origin_order + change_amount - 1).update_all("display_order=display_order+1")
        end
        self.update(display_order: origin_order + change_amount)
        return true
      end
    rescue
      return false
    end
  end
end
