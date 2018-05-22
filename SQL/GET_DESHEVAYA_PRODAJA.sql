/* �������� ������� �������, �������, ��� ���� � ������ A */

if exists(select 1 from sys.procedures as a where a.name = 'GET_DESHEVAYA_PRODAJA') drop procedure dbo.GET_DESHEVAYA_PRODAJA;

GO

create procedure [dbo].[GET_DESHEVAYA_PRODAJA]
  -- �� ������ A, � ������� ���� ����������
  @m_org_id_a int,
  -- ������ �� ������, ������� ���� ���������
  @o_sklad_ras_id int
as begin

  -- ��� ���������� "������� �������"
  declare @O_OPOV_TIP_DESHEVAYA_PRODAJA int = 2;

  select
    p.*
  from
    dbo.O_SKLAD_RAS r
    join dbo.O_SKLAD_RAS_PRODUCT p on p.O_SKLAD_RAS_ID = r.ID
  where
    r.ID = @o_sklad_ras_id
    -- ����� �����
    and p.IS_VID = 1
    -- �������, ��� ������� ������ A
    and exists(
      select
        *
      from
        dbo.O_DILER_A_PRICE price
      where
        price.M_PRODUCT_ID_TOVAR = p.M_PRODUCT_ID
        -- ������� �������, ��� �������
        and price.ROZN > p.COST
        -- � ��� �� ���� ���������� �� ����� �������
        and not exists(
          select
            *
          from
            dbo.O_OPOV o
          where
            o.TIP = @O_OPOV_TIP_DESHEVAYA_PRODAJA
            and o.O_SKLAD_RAS_PRODUCT_ID = p.ID
        )
    )
  ;


end; -- proc

GO

exec [dbo].[GET_DESHEVAYA_PRODAJA] @m_org_id_a = 2, @o_sklad_ras_id = 10
