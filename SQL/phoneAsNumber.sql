/* убрать лишние символы из маски телефона, было +7(927) 037-98-52 стало 79270379852 */
if exists(select * from sys.objects where [object_id] = object_id('phoneAsNumber') and [type] in ('FN', 'IF', 'TF')) drop function dbo.phoneAsNumber;

go

CREATE function dbo.phoneAsNumber(@phone varchar(500)) returns varchar(500) as begin


  return 
      replace(
        replace( 
          replace(
            replace(
              replace(@phone, '-', '')
              ,'+'
              ,''
            )
            ,'('
            ,''
          )
          ,')'
          ,''
        )
        ,' '
        ,''
      )
  ;

end;